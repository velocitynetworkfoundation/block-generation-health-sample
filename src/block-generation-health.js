const { flow, filter, first } = require('lodash/fp');
const env = require('env-var');
const got = require('got');
const ethers = require('ethers');
const BigNumber = require('bignumber.js');

const enodeRegExp = /(enode:\/\/)([0-9a-zA-Z].*)@(.*)/
const nodesRoundsMargin = 2;

const run = async () => {
  const nodeUrl = env.get('NODE_URL').required(true).asString();
  const tokenEndpoint = env.get('TOKEN_ENDPOINT').required(true).asString();
  const clientId = env.get('CLIENT_ID').required().asString(true);
  const clientSecret = env.get('CLIENT_SECRET').required(true).asString();

  try {
    const authToken = await getToken(tokenEndpoint, clientId, clientSecret);
    const connInfo = {
      rejectUnauthorized: false,
      url: nodeUrl,
      headers: { Authorization: `Bearer ${authToken}` }
    };
    const provider = new ethers.providers.StaticJsonRpcProvider(connInfo);
    const blockNumber = await provider.getBlockNumber();
    const enode = await provider.send('net_enode', []);
    const publicKey = enode.match(enodeRegExp)[2];
    const address = ethers.utils.computeAddress(`0x04${publicKey}`).toLowerCase();
    const metrics = await provider.send('ibft_getSignerMetrics', []);
    const nodeMetrics = getNodeMetrics(address, metrics)
    const nodesCount = metrics.length;
    const blocksSinceLast = getBlocksCountSinceLast(blockNumber, nodeMetrics.lastProposedBlockNumber);
    const result = blocksSinceLast > nodesCount * nodesRoundsMargin
      ? { status: "DOWN" }
      : { status: "UP" };
      
    console.info(JSON.stringify(result, null, 2));
  } catch (error) {
    console.info(JSON.stringify({ status: "DOWN", error }, null, 2));  
  }

};

const getToken = async (tokenEndpoint, clientId, clientSecret) => {
  const authResult = await got.post(tokenEndpoint, {
    json: {
      client_id: clientId,
      client_secret: clientSecret,
      audience: 'https://velocitynetwork.node',
      grant_type: 'client_credentials'
    }
  }).json();

  return authResult.access_token;
};

const getNodeMetrics = (address, metrics) => flow(
  filter((metric) => metric.address === address),
  first
)(metrics);

const getBlocksCountSinceLast = (blockNumber, lastBlock) => new BigNumber(blockNumber)
  .minus(new BigNumber(lastBlock, 16))
  .toFixed();

module.exports = run;
# Block Generation Health Check Sample
Sample code for running a test to check whether a given blockchain validator is producing blocks or not.

## Prerequisites
The following are required for running the example in this repository:
- Node.JS.
- Client ID and secret that were generated as a result of the registration of the Node Operator service endpoint on Velocity's registrar service. The metrics required to perform the check implemented here, require access to statistics that can only be retrieved using those credentials.

## Sample Walkthrough
The sample in this repository performs the following steps to reach a result that indicates whether blocks are being generated or not:
- Reads the node's URL, the client ID, the client secret and the tokens endpoint from environment variables.
- Gets a token using the Client ID and secret.
- Gets the current block number.
- Gets the node's `enode` URL.
- Derives the node's Ethereum address from the `enode` URL.
- Gets block generation statistics for all validator nodes in the network.
- Extracts the current node's statistics from the list of all validators.
- Calculates how many blocks have been generated since the node generated it's last block.
- Determines whether the node is healthy or not by checking if the last block by the node was more than two times the number of validators ago (meaning more than two block generation rounds have completed since the last produced block).

## Running The Sample
- Clone this repository locally.
- Run `npm i` to install all dependencies.
- Set values for the required environment variables (`NODE_URL`, `TOKEN_ENDPOINT`, `CLIENT_ID`, `CLIENT_SECRET`).
- Run `node .` to execute the script (if located at the root directory of the cloned GitHub repository).

### Notes
- `TOKEN_ENDPOINT` should hold the URL to Velocity's identity providers endpoint for retrieving token, which for `mainnet` is `https://velocitynetwork.us.auth0.com/oauth/token`.
- `NODE_URL` should hold the node's full URL including HTTP scheme and port if using a non-standard one, for example `https://some.validator.com:8545`.
- Running this script against a non-validator node will fail the check, as block generation statistics are only available for nodes that are producing blocks, meaning nodes that were voted to be promoted to validators.



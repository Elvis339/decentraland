# Explanation
Hackaton project for decentralized q&a leveraging p2p network and Shamir secret sharing algorithm.
Shamir's Secret Sharing can be seen as a form of MPC, in the sense that it allows a secret to be encrypted and divided into a number of shares, such that a threshold number of shares is required to decrypt the secret,
this means that we as a company do not hold all the power and can trust community to run these nodes.

Workflow:
1. Users sends encrypted vote to the gateway node
2. Gateway node emits an event in the p2p network to send their shares in order to decrypt the message
3. Once Gateway node receives the shares it can decrypt the message and store it in `packages/gateway/consensus.sql`

Note: I didn't had time to implement disputes and reward.

# Installation
1. `yarn install`
2. `yarn bootstrap` (run from the root directory)
3. `cd packages/node && sudo chmod +x bin.mjs`

# How to
1. Generate identity as a voter `cd packages/gateway && node index.mjs identity`  
This will generate `packages/gateway/identity.json` file that will represent your public and private key as well as wallet address.
2. Each node has part of the private key used to decrypt the message, generate share for each node by running:  
` node index.mjs generate:shares --secret 0xdcb3f79eb1ef0c42c7d2de803cb6a0331d2d6934f8d3e21c78f58d9edf808ba0 --totalShares 3 --requiredShares 3`
Running this command will output 3 shares which combined will be used to decrypt a message. It's using Shamir's secret sharing (SSS) algorithm for distributing private information.
3. Open 4 different terminal windows, in first run `cd packages/gateway` and in the rest `cd packages/node`
4. ![Screenshot 2022-12-19 at 16.58.35.png](Screenshot%202022-12-19%20at%2016.58.35.png)
5. Run the nodes first! then in the `packages/gateway` run `node index.mjs vote` you should see that peers are connecting
6. Output should look like ![Screenshot 2022-12-19 at 17.03.46.png](Screenshot%202022-12-19%20at%2017.03.46.png)

## Commands
Make sure you are in `cd packages/gateway`

1. `node index.mjs identity` - Generate new identity
2. `node index.mjs vote` - Starts gateway node for voting, cannot be used as standalone node, requires other nodes to be available for connection
3. `node index.mjs print` - Prints output of the votes (like replica to IPFS) in `packages/gateway/records.json`
4. `node index.mjs generate:shares --help` - Generate shares for a secret
5. `node index.mjs derive:secret --help` - Derive secret from shares

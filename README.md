[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
# WT NodeJS API
API written in nodejs to interact with the Winding Tree platform, it creates an
http server with an encrypted ethereum account to send transactions to the WT
platform hosted over the ethereum network.

## Requirements
- Nodejs 8.9.x LTS

### Getting stared
In order to install and run test we must:
```
git clone git@github.com:windingtree/wt-nodejs-api.git
nvm install
npm install
npm test
```

### Running dev mode
With all the dependencies installed, you can start the dev server.
First step is start Ganache.
```bash
npm run dev-net
```

Ganache starts with 2 default accounts, one of them is an hotel manager with address `0x0ba3cd50b07ee204a47246b6b2f274fd41805c47`.
The id for this account is `9a4ce26b-80d7-4c71-8d5b-5518b75f7b55` and is stored
encrypted in `keys/9a4ce26b-80d7-4c71-8d5b-5518b75f7b55.enc`.
The password for this default waller is `blockchain101`.

Now we can run our dev server.
```bash
npm run dev
```
When `ETH_NETWORK=local` we run internally a script to deploy WT Index.

#### Using local swagger

To use Swagger pointing to localhost, you must update `docs/swagger.json`

```javascript
{
  "schemes": ["http"],
  "host": "localhost:3000"
}

```


## Examples
### Wallets
The very first thing to do, is to add a Wallet. This wallet is used to make
transactions with the Ethereum network. An example of encrypted keystore v3
JSON:
```javaScript
{
    version: 3,
    id: '04e9bcbb-96fa-497b-94d1-14df4cd20af6',
    address: '2c7536e3605d9c16a7a3d7b1898e529396a65c23',
    crypto: {
        ciphertext: 'a1c25da3ecde4e6a24f3697251dd15d6208520efc84ad97397e906e6df24d251',
        cipherparams: { iv: '2885df2b63f7ef247d753c82fa20038a' },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: {
            dklen: 32,
            salt: '4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10',
            n: 262144,
            r: 8,
            p: 1
        },
        mac: 'b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6'
    }
}
```

This wallet should be add by a POST to `/wallets`. This will be encrypted and
stored under `/keys` directory as `04e9bcbb-96fa-497b-94d1-14df4cd20af6.enc`.




For the current endpoints documentation, run the API with `npm run dev` and see the `http://localhost:3000/docs`.

With every request that results into a transaction on the Ethereum network (typically data modification),
you have to provide a password for this keyfile in a `X-Wallet-Password` header.

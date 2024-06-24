This repo is used to one-time transfer ETH/stETH/wstETH to addresses in addresses.json. If transfer done, the address is stored in claimedAddresses.json

If there is no addresses.json or claimedAddresses.json, create them first. Both are the raw array json.

# ENV Parameters (.env)

```
PRIVATE_KEY=sender_private_key
INFURA_PROJECT_ID=infura_project_id
INFURA_PROJECT_SECRET=infura_project_secret
ETH_AMOUNT=0.01
STETH_AMOUNT=0.01
WSTETH_AMOUNT=0.01
```

## Install

`$ npm install`

## Run
`$ npm start`
This repo is used to one-time transfer ETH/stETH/wstETH to addresses in addresses.json. If an address is in the eligibile address list and hasn't been used to claim, transfers will be arranged.

Initially, create a `data` folder for `addresses.json` and `claimedAddresses.json`. 

Both are the raw array json. `Addresses.json` includes the addresses that are eligible to claim. `claimedAddresses.json` includes the addresses that have claimed faucet.

NOTE: Make sure to create both `addresses.json` and `claimedAddresses.json`. The second one should contain only "[]" if you are starting the application for the first time.


# ENV Parameters (.env)

```
PRIVATE_KEY=sender_private_key

INFURA_PROJECT_ID=infura_project_id

ETH_AMOUNT=0.01
STETH_AMOUNT=0.01
WSTETH_AMOUNT=0.01
```

## Install

`$ npm install`

## Run
`$ npm start`

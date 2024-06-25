// transferToken.js

const { ethers } = require('ethers');
require('dotenv').config();
const logger = require('./logger');

// Infura settings
const infuraProjectId = process.env.INFURA_PROJECT_ID;

// Holesky network configuration
const holeskyNetwork = {
    name: 'holesky',
    chainId: 17000,
    ensAddress: null,
    _defaultProvider: (providers) => new providers.JsonRpcProvider(`https://holesky.infura.io/v3/${infuraProjectId}`)
};

// Create a provider using Infura for Holesky
const provider = new ethers.JsonRpcProvider(`https://holesky.infura.io/v3/${infuraProjectId}`, holeskyNetwork);

// Create a wallet instance using your private key
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// stETH token contract address on Holesky testnet
const stETHAddress = '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034'; // Replace with actual Holesky stETH address
// wstETH token contract address on Holesky testnet
const wstETHAddress = '0x8d09a4502Cc8Cf1547aD300E066060D043f6982D'; // Replace with actual Holesky wstETH address

// Token ABI (only transfer function)
const tokenAbi = [
    "function transfer(address recipient, uint256 amount) public returns (bool)"
];

// Create contract instances
const stETHContract = new ethers.Contract(stETHAddress, tokenAbi, wallet);
const wstETHContract = new ethers.Contract(wstETHAddress, tokenAbi, wallet);

// Function to validate Ethereum address
function isValidEthereumAddress(address) {
    return ethers.isAddress(address);
}

async function transferETH(toAddress) {
    const amountToSend = ethers.parseEther(process.env.ETH_AMOUNT);
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * 12 * (1 + Date.now() % 3)));

        try {
            const nonce = await provider.getTransactionCount(wallet.address, 'latest');
            const feeData = await provider.getFeeData();

            const transaction = {
                to: toAddress,
                value: amountToSend,
                gasLimit: '21000',
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                nonce: nonce,
                type: 2,
                chainId: 17000, // Holesky chain ID
            };

            const txResponse = await wallet.sendTransaction(transaction);
            await txResponse.wait();
            logger.info(`transferETH to: ${toAddress}, hash: ${txResponse.hash}`);
            return; // Success, exit the function
        } catch (error) {
            retries++;
            logger.warn(`Attempt ${retries} failed to transfer ETH: ${error.message}`);

            if (retries >= maxRetries) {
                logger.error(`Failed to transfer ETH after ${maxRetries} attempts: ${error}`);
                throw new Error('Failed to transfer ETH');
            }
        }
    }
}

async function transferStETH(toAddress) {
    const amountToSend = ethers.parseEther(process.env.STETH_AMOUNT);
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        // wait to decrease the nonce conflict problem
        await new Promise(resolve => setTimeout(resolve, 1000 * 12 * (1 + Date.now() % 3)));

        try {
            const tx = await stETHContract.transfer(toAddress, amountToSend);
            const receipt = await tx.wait();
            logger.info(`transferStETH to: ${toAddress}, hash: ${receipt.transactionHash}`);
            return; // Success, exit the function
        } catch (error) {
            retries++;
            logger.warn(`Attempt ${retries} failed to transfer stETH: ${error.message}`);

            if (retries >= maxRetries) {
                logger.error(`Failed to transfer stETH after ${maxRetries} attempts: ${error}`);
                throw new Error('Failed to transfer stETH');
            }
        }
    }
}


async function transferWstETH(toAddress) {
    const amountToSend = ethers.parseEther(process.env.WSTETH_AMOUNT);
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        // wait to decrease the nonce conflict problem
        await new Promise(resolve => setTimeout(resolve, 1000 * 12 * (1 + Date.now() % 3)));

        try {
            const tx = await wstETHContract.transfer(toAddress, amountToSend);
            const receipt = await tx.wait();
            logger.info(`transferWstETH to: ${toAddress}, hash: ${receipt.transactionHash}`);
            return; // Success, exit the function
        } catch (error) {
            retries++;
            logger.warn(`Attempt ${retries} failed to transfer WstETH: ${error.message}`);

            if (retries >= maxRetries) {
                logger.error(`Failed to transfer WstETH after ${maxRetries} attempts: ${error}`);
                throw new Error('Failed to transfer wstETH');
            }
        }
    }
}

module.exports = {
    transferETH,
    transferStETH,
    transferWstETH,
    isValidEthereumAddress
};
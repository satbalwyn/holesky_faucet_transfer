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

// Function to transfer ETH
async function transferETH(toAddress) {
    const amountToSend = ethers.parseEther(process.env.ETH_AMOUNT);

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

    try {
        const txResponse = await wallet.sendTransaction(transaction);
        await txResponse.wait();
        logger.info("transferETH to: ", toAddress, txResponse.hash);
        // return txResponse.hash;
    } catch (error) {
        logger.error('Error transferring ETH:', error);
        throw new Error('Failed to transfer ETH');
    }
}

// Function to transfer stETH
async function transferStETH(toAddress) {
    const amountToSend = ethers.parseEther(process.env.STETH_AMOUNT); // Fixed amount to send (0.01 stETH)

    try {
        const tx = await stETHContract.transfer(toAddress, amountToSend);
        const receipt = await tx.wait();
        // return receipt.transactionHash;
        logger.info("transferStETH:", toAddress, receipt.transactionHash);
    } catch (error) {
        logger.error('Error transferring stETH:', error);
        throw new Error('Failed to transfer stETH');
    }
}

// Function to transfer wstETH
async function transferWstETH(toAddress) {
    const amountToSend = ethers.parseEther(process.env.WSTETH_AMOUNT);

    try {
        const tx = await wstETHContract.transfer(toAddress, amountToSend);
        const receipt = await tx.wait();
        // return receipt.transactionHash;
        logger.info("transferWstETH:", toAddress, receipt.transactionHash);
    } catch (error) {
        logger.error('Error transferring wstETH:', error);
        throw new Error('Failed to transfer wstETH');
    }
}

module.exports = {
    transferETH,
    transferStETH,
    transferWstETH,
    isValidEthereumAddress
};
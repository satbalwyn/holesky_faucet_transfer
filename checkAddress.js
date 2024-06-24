// checkAddress.js

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

// Paths to the JSON files
const allowedAddressesPath = path.join(__dirname, 'data', 'addresses.json');
const claimedAddressesPath = path.join(__dirname, 'data', 'claimedAddresses.json');

// Variables to store the loaded addresses
let allowedAddressesSet = null;
let claimedAddressesSet = null;

// Function to load addresses from a file
async function loadAddresses(filePath, setVariable) {
    if (setVariable !== null) {
        return setVariable;
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const addresses = JSON.parse(data);
        if (!Array.isArray(addresses)) {
            throw new Error(`Invalid format: ${filePath} should contain a raw string array`);
        }
        return new Set(addresses.map(address => address.toLowerCase()));
    } catch (error) {
        logger.error(`Error loading addresses from ${filePath}:`, error);
        return new Set(); // Return an empty set if there's an error
    }
}

// Function to load allowed addresses
async function loadAllowedAddresses() {
    allowedAddressesSet = await loadAddresses(allowedAddressesPath, allowedAddressesSet);
    return allowedAddressesSet;
}

// Function to load claimed addresses
async function loadClaimedAddresses() {
    claimedAddressesSet = await loadAddresses(claimedAddressesPath, claimedAddressesSet);
    return claimedAddressesSet;
}

// Function to check if an address is included in the allowed list
async function isAddressAllowed(address) {
    const allowedAddresses = await loadAllowedAddresses();
    return allowedAddresses.has(address.toLowerCase());
}

// Function to check if an address has already claimed
async function hasAddressClaimed(address) {
    const claimedAddresses = await loadClaimedAddresses();
    return claimedAddresses.has(address.toLowerCase());
}


// Function to add an address to the claimed addresses set and update the JSON file
async function addClaimedAddress(address) {
    const claimedAddresses = await loadClaimedAddresses();
    const lowerCaseAddress = address.toLowerCase();

    if (!claimedAddresses.has(lowerCaseAddress)) {
        claimedAddresses.add(lowerCaseAddress);
        await fs.writeFile(claimedAddressesPath, JSON.stringify(Array.from(claimedAddresses), null, 2));
        logger.info(`Address ${address} added to claimed addresses`);
        
    }
}

module.exports = {
    isAddressAllowed,
    hasAddressClaimed,
    addClaimedAddress
};
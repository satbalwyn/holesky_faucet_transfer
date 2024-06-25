// server.js

const express = require('express');
const path = require('path');
const logger = require('./logger');

const { transferETH, transferStETH, transferWstETH, isValidEthereumAddress } = require('./transferToken');
const { isAddressAllowed, hasAddressClaimed, addClaimedAddress } = require('./checkAddress');

const app = express();
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const inProgress = new Map();

app.post('/api/transfer', async (req, res) => {
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: 'Recipient address is required' });
    }

    if (!isValidEthereumAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    let token;
    let failed = false;

    //  Do no allow multiple claims
    if (inProgress.get(address)) {
        return res.status(500).json({ error: 'Already processing this address' });
    }
    //  Mark address as being processed to avoid multiple claims
    inProgress.set(address, true);

    try {

      const isAllowed = await isAddressAllowed(address);
      if (!isAllowed) {
          inProgress.delete(address);
          return res.status(403).json({ error: 'Address is not allowed to claim' });
      }

      const hasClaimed = await hasAddressClaimed(address);
      if (hasClaimed) {
          inProgress.delete(address);
          return res.status(403).json({ error: 'Address has already claimed' });
      }

      switch (Date.now() % 3) {
        case 0:
            token = 'ETH';
            await transferETH(address);
            break;
        case 1:
            token = 'stETH';
            await transferStETH(address);
            break;
        case 2:
            token = 'wstETH';
            await transferWstETH(address);
            break;
      }
        res.json({ 
            message: `${token} transferred`
        });

    } catch (error) {
        failed = true;
        logger.error(
            `Error processing claim: ${error}`
        );
        res.status(500).json({ error: 'Failed to process claim', details: error.message });
    }

    if (!failed) {
        await addClaimedAddress(address);
    }

    inProgress.delete(address);
});

// For any other routes, serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});

module.exports = app;
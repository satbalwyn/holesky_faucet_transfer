// server.js

const express = require('express');
const path = require('path');
const logger = require('./logger');

const { transferETH, transferStETH, transferWstETH, isValidEthereumAddress } = require('./transferToken');
const { isAddressAllowed, hasAddressClaimed, addClaimedAddress } = require('./checkAddress');

const app = express();
app.use(express.json());
// app.use(cors()); // Enable CORS for all routes

// CORS configuration
// const corsOptions = {
//     origin: 'http://localhost:3000',
//     methods:  ['GET', 'POST'],
//     allowedHeaders: ['Content-Type'],
// };

// // Enable CORS for all routes
// app.use(cors(corsOptions));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/transfer', async (req, res) => {
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: 'Recipient address is required' });
    }

    if (!isValidEthereumAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    try {

      const isAllowed = await isAddressAllowed(address);
      if (!isAllowed) {
          return res.status(403).json({ error: 'Address is not allowed to claim' });
      }

      const hasClaimed = await hasAddressClaimed(address);
      if (hasClaimed) {
          return res.status(403).json({ error: 'Address has already claimed' });
      }

        await transferETH(address);
        await transferStETH(address);
        await transferWstETH(address);

        await addClaimedAddress(address);

        res.json({ 
            message: 'transfer done'
        });

    } catch (error) {
        logger.error(
            `Error processing claim: ${error}`
        );
        res.status(500).json({ error: 'Failed to process claim', details: error.message });
    }
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
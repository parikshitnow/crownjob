// fetchAndUpdateJob.js
const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const db = require('../models/index.js');


async function fetchAndUpdateJob() {
  
  const { default: fetch } = await import('node-fetch');  // ESM dynamic import

  const { Details } = db;

  if (!Details) {
    console.error('Details model is not loaded properly!');
    process.exit(1);  // Exit if model is missing
  }

  cron.schedule('30 8 * * 1-5', async () => {
    console.log('Running the fetch and update job at 8:30 PM (Mon-Fri)...');

    try {
      const url = 'https://api.kite.trade/instruments';
      const tempFilePath = path.resolve('temp', 'instruments.csv');

      // Ensure temp directory exists
      await fs.ensureDir(path.dirname(tempFilePath));

      // Fetch and save the CSV file
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch the CSV file');
      const fileStream = fs.createWriteStream(tempFilePath);
      response.body.pipe(fileStream);

      // Wait for the file to finish writing
      await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      console.log('CSV file downloaded successfully.');

      // Parse the CSV and update the database
      const rows = [];
      fs.createReadStream(tempFilePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', async () => {
          console.log('CSV file parsed successfully.');

          // Upsert data into the database
          for (const row of rows) {
            await Details.upsert({
              instrument_token: row.instrument_token,
              exchange_token: row.exchange_token,
              tradingsymbol: row.tradingsymbol,
              name: row.name,
              last_price: row.last_price,
              expiry: row.expiry,
              strike: row.strike,
              tick_size: row.tick_size,
              lot_size: row.lot_size,
              instrument_type: row.instrument_type,
              segment: row.segment,
              exchange: row.exchange,
            });
          }

          console.log('Database updated successfully.');
        });
    } catch (error) {
      console.error('Error in fetch and update job:', error);
    }
  });
}

// Export the function properly after dynamic import
module.exports = fetchAndUpdateJob;

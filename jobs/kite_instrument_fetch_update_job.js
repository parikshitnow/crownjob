const cron = require('node-cron');
const fs = require('fs-extra');
const fastcsv = require('fast-csv');
const path = require('path');
const db = require('../models/index.js');
const { sequelize } = db;  // Get Sequelize instance

async function KiteInstrumentFetchAndUpdateJob() {
  const { KiteInstrument } = db;

  if (!KiteInstrument) {
    console.error('KiteInstrument model is not loaded properly!');
    process.exit(1);
  }

  const { default: fetch } = await import('node-fetch');

  cron.schedule('37 11 * * 1-5', async () => {
    console.log('Running the fetch and update job at 8:30 AM (Mon-Fri)...');

    try {
      const url = 'https://api.kite.trade/instruments';
      const tempFilePath = path.resolve('temp', 'instruments.csv');

      await fs.ensureDir(path.dirname(tempFilePath));

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch the CSV file');

      const fileStream = fs.createWriteStream(tempFilePath);
      response.body.pipe(fileStream);

      // Wait for fileStream to finish
      await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      console.log('CSV file downloaded successfully.');

      // Parse CSV file and process rows
      const rows = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(tempFilePath)
          .pipe(fastcsv.parse({ headers: true, skipEmptyLines: true }))
          .on('data', (row) => {
            rows.push({
              instrument_token: parseInt(row.instrument_token, 10),
              exchange_token: parseInt(row.exchange_token, 10),
              tradingsymbol: row.tradingsymbol,
              name: row.name,
              last_price: parseFloat(row.last_price),
              expiry: row.expiry.toString(),
              strike: parseFloat(row.strike),
              tick_size: parseFloat(row.tick_size),
              lot_size: parseInt(row.lot_size, 10),
              instrument_type: row.instrument_type,
              segment: row.segment,
              exchange: row.exchange,
            });
          })
          .on('end', () => {
            console.log('CSV file parsed successfully. Number of rows:', rows.length);  // Log count, not rows data
            resolve();  // Resolve promise after parsing
          })
          .on('error', reject);
      });

      // console.log('CSV file parsed successfully.');

      // Send the batch of rows to the stored procedure
      await sequelize.query('CALL upsert_kite_instruments(:json_data)', {
        replacements: {
          json_data: JSON.stringify(rows),  // Send the entire array of rows as JSON
        },
        type: sequelize.QueryTypes.RAW,  // Raw query, as we're calling a stored procedure
        logging: false, 
      });

      console.log('Database update job completed successfully.');

    } catch (error) {
      console.error('Error in fetch and update job:', error);
    }
  });
}

module.exports = KiteInstrumentFetchAndUpdateJob;

// fetchAndUpdateJob.js
const cron = require('node-cron');
const fs = require('fs-extra');
const fastcsv = require('fast-csv');
const path = require('path');
const db = require('../models/index.js');

async function KiteInstrumentFetchAndUpdateJob() {
  const { KiteInstrument } = db;

  if (!KiteInstrument) {
    console.error('KiteInstrument model is not loaded properly!');
    process.exit(1);
  }

  const { default: fetch } = await import('node-fetch');  //improves performance and loaded module when needed.

  const cron = require('node-cron');
  cron.schedule('30 08 * * 1-5', async () => {
    console.log('Running the fetch and update job at 8:30 AM (Mon-Fri)...');

    try {
      const url = 'https://api.kite.trade/instruments';
      const tempFilePath = path.resolve('temp', 'instruments.csv');

      await fs.ensureDir(path.dirname(tempFilePath));

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch the CSV file');
      const fileStream = fs.createWriteStream(tempFilePath);
      response.body.pipe(fileStream);

      await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      console.log('CSV file downloaded successfully.');

      const rows = [];
      fs.createReadStream(tempFilePath)
        .pipe(fastcsv.parse({ headers: true, skipEmptyLines: true }))
        .on('data', (row) => rows.push(row))
        .on('end', async () => {
          console.log('CSV file parsed successfully.');

          // Map rows to the required data structure for bulkInsert
          const dataToInsert = rows.map((row) => ({
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
          }));

          // Perform bulkCreate with updateOnDuplicate for upsert-like behavior
          await KiteInstrument.bulkCreate(dataToInsert, {
            updateOnDuplicate: [
              'exchange_token', 
              'name', 
              'last_price', 
              'expiry', 
              'strike', 
              'tick_size', 
              'lot_size', 
              'instrument_type', 
              'segment', 
              'exchange'
            ],
          });
          

          console.log('Database updated successfully.');
        });
    } catch (error) {
      console.error('Error in fetch and update job:', error);
    }
  });
}

module.exports = KiteInstrumentFetchAndUpdateJob;

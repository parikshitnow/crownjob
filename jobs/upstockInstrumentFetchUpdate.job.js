const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const db = require('../models/index.js');
const { sequelize } = db;
const zlib = require('zlib');
const fastcsv = require('fast-csv');
const { pipeline } = require('stream/promises');

async function upstoxInstrumentFetchAndUpdateJob() {
  const { upstoxInstrument } = db;

  if (!upstoxInstrument) {
    console.error('upstoxInstrument model is not loaded properly!');
    process.exit(1);
  }

  const { default: fetch } = await import('node-fetch');
  
  cron.schedule('06 19 * * 1-5', async () => {
    console.log('Running the fetch and update job at 4:18 PM (Mon-Fri)...');

    try {
      const url = 'https://assets.upstox.com/market-quote/instruments/exchange/complete.csv.gz';
      const tempGzFilePath = path.resolve('temp', 'complete.csv.gz');
      const tempCsvFilePath = path.resolve('temp', 'complete.csv');

      // Ensure the temp directory exists
      await fs.ensureDir(path.dirname(tempGzFilePath));

      // Download the .gz file
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch the .gz file');

      const gzFileStream = fs.createWriteStream(tempGzFilePath);
      await pipeline(response.body, gzFileStream);

      console.log('.gz file downloaded successfully.');

      // Extract the .gz file
      const gzipStream = fs.createReadStream(tempGzFilePath).pipe(zlib.createGunzip());
      const csvFileStream = fs.createWriteStream(tempCsvFilePath);
      await pipeline(gzipStream, csvFileStream);

      console.log('.csv file extracted successfully.');

      // Parse the extracted .csv file
      const rows = [];
      const parseStream = fs.createReadStream(tempCsvFilePath).pipe(
        fastcsv.parse({ headers: true, skipEmptyLines: true })
      );

      parseStream.on('data', (row) => {
        // Validation and transformation
      

        rows.push({
          instrument_key: row.instrument_key,
          exchange_token: parseInt(row.exchange_token, 10),
          tradingsymbol: row.tradingsymbol,
          name: row.name,
          last_price: parseFloat(row.last_price),
          expiry: row.expiry?.toString(),
          strike: row.strike,
          tick_size: parseFloat(row.tick_size),
          lot_size: parseInt(row.lot_size, 10),
          instrument_type: row.instrument_type,
          option_type: row.option_type ,
          exchange: row.exchange,
        });
      });

      await new Promise((resolve, reject) => {
        parseStream.on('end', resolve);
        parseStream.on('error', reject);
      });

      console.log('CSV file parsed successfully. Number of rows:', rows.length);

      // Send the batch of rows to the stored procedure
      await sequelize.query('CALL upsert_upstox_instruments(:json_data)', {
        replacements: {
          json_data: JSON.stringify(rows),
        },
        type: sequelize.QueryTypes.RAW,
        logging: false,
      });

      console.log('Database upstox update job completed successfully.');

      // Clean up temporary files
      await fs.remove(tempGzFilePath);
      await fs.remove(tempCsvFilePath);

    } catch (error) {
      console.error('Error in fetch and update job:', error);
    }
  });
}

module.exports = upstoxInstrumentFetchAndUpdateJob;

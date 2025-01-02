// const cron = require('node-cron');
// const db = require('../models/index.js');
// const { sequelize } = db;
// const path = require('path');
// const axios = require('axios')

// async function upstoxEveryMinuteEqUpdates() {
//   const { upstoxEqPrices } = db;

//   if (!upstoxEqPrices) {
//     console.error('upstoxEqPrices model is not loaded properly!');
//     process.exit(1);
//   }

//   const { default: fetch } = await import('node-fetch');

//   cron.schedule('* * * * 1-5', async () => {
//     console.log('Running the upstoxEqUpdates job every minute');
//     try {
//         const data = await sequelize.query('CALL extract_instrument_key_nse_eq_list(:result)', {
//             replacements: { result: null }, 
//             type: sequelize.QueryTypes.RAW,
//             logging: false,
//           });
          

//       const result = data[0][0].result; 

//       const response = await axios.get(
//         `https://api.upstox.com/v2/market-quote/quotes`,
//         {
//           params: { instrument_key: result.join(',')},
//           headers: {
//             'accept': 'application/json',
//             'Authorization': `Bearer ${process.env.UPSTOX_API_ACCESS_TOKEN}`
//           }
//         }
//       );
  
//       console.log(response.data);
        
//     } catch (error) {
//       // Log the error to debug the issue
//       console.error('Error in upstoxEqUpdates job:', error);
//     }
//   });
// }

// module.exports = upstoxEveryMinuteEqUpdates;



const cron = require('node-cron');
const db = require('../models/index.js');
const { sequelize } = db;
const axios = require('axios');

// Utility function to introduce delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function upstoxEveryMinuteEqUpdates() {
  const { upstoxEqPrices } = db;

  if (!upstoxEqPrices) {
    console.error('upstoxEqPrices model is not loaded properly!');
    process.exit(1);
  }

  cron.schedule('* * * * 1-5', async () => {
    console.log('Running the upstoxEqUpdates job every minute');
    try {
      const data = await sequelize.query('CALL extract_instrument_key_nse_eq_list(:result)', {
        replacements: { result: null },
        type: sequelize.QueryTypes.RAW,
        logging: false,
      });

      const result = data[0][0].result;

      // Split result into batches of 50
      const batchSize = 80;
      const batches = [];
      for (let i = 0; i < result.length; i += batchSize) {
        batches.push(result.slice(i, i + batchSize));
      }

      // Function to send batches concurrently, limited to 10 at a time
      const sendBatchesConcurrently = async (batches) => {
        const batchResponses = [];
        for (let i = 0; i < batches.length; i += 10) {
          // Limit to 10 concurrent requests
          const currentBatches = batches.slice(i, i + 10);
          const batchPromises = currentBatches.map(async (batch, index) => {
            try {
              // Delay between each batch request
              if (index > 0) {
                await delay(500); // Delay of 500ms between each batch request
              }

              const response = await axios.get(
                'https://api.upstox.com/v2/market-quote/quotes',
                {
                  params: { instrument_key: batch.join(',') },
                  headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${process.env.UPSTOX_API_ACCESS_TOKEN}`,
                  },
                }
              );

              // Check for error and handle invalid instrument_key individually
              if (response.data.errors) {
                // For each invalid instrument_key, remove it from the batch
                const validKeys = batch.filter(key => {
                  return !response.data.errors.some(error => error.errorCode === 'UDAPI1087' && error.invalidValue === key);
                });
                
                if (validKeys.length === 0) {
                  console.log(`All instruments in batch failed: ${batch}`);
                  return null; // If all instruments in a batch fail, return null
                }
                return { data: validKeys }; // Only return valid instrument keys
              }

              return response.data;
            } catch (error) {
              console.error(`Error fetching batch ${batch}:`, error.response?.data?.errors || error.message);
              return null;
            }
          });

          // Wait for the current batch to finish before moving to the next one
          const currentBatchResponses = await Promise.allSettled(batchPromises);
          batchResponses.push(...currentBatchResponses.filter(result => result.status === 'fulfilled').map(result => result.value));
        }

        return batchResponses;
      };

      // Get all batch responses
      const allBatchResponses = await sendBatchesConcurrently(batches);

      // Filter out null responses in case of errors
      const successfulResponses = allBatchResponses.filter(response => response !== null);

      // Combine all batch responses into one array
      const combinedResponse = successfulResponses.flatMap(response => response.data);
      console.log(combinedResponse.length);

    } catch (error) {
      console.error('Error in upstoxEqUpdates job:', error);
    }
  });
}

module.exports = upstoxEveryMinuteEqUpdates;


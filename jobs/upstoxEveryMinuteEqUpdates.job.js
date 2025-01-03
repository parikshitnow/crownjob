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
          

//       let result = data[0][0].result; 
//       result = result.slice(0,80);
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














// const cron = require('node-cron');
// const db = require('../models/index.js');
// const { sequelize } = db;
// const axios = require('axios');

// async function upstoxEveryMinuteEqUpdates() {
//   let num=1;
//   const { upstoxEqPrices } = db;

//   if (!upstoxEqPrices) {
//     console.error('upstoxEqPrices model is not loaded properly!');
//     process.exit(1);
//   }

//   cron.schedule('* * * * 1-5', async () => {
//     console.log('Running the upstoxEqUpdates job every minute');

//     try {
//       const data = await sequelize.query('CALL extract_instrument_key_nse_eq_list(:result)', {
//         replacements: { result: null },
//         type: sequelize.QueryTypes.RAW,
//         logging: false,
//       });

//       let result = data[0][0].result;
//       const batchSize = 80; // Each batch contains 80 tokens
//       const maxBatchesPerSecond = 24; // Maximum of 24 batches sent sequentially per second
//       let finalResponses = {};

//       while (result.length > 0) {
//         const currentBatches = result.splice(0, batchSize * maxBatchesPerSecond);

//         // Process 24 batches sequentially within 1 second
//         for (let i = 0; i < currentBatches.length; i += batchSize) {
//           const batch = currentBatches.slice(i, i + batchSize);

//           try {
//             // console.log('Sending request with params:', { instrument_key: batch.join(',') });
            
//             const response = await axios.get(
//               `https://api.upstox.com/v2/market-quote/quotes`,
//               {
//                 params: { instrument_key: batch.join(',') },
//                 headers: {
//                   'accept': 'application/json',
//                   'Authorization': `Bearer ${process.env.UPSTOX_API_ACCESS_TOKEN}`,
//                 },
//               }
//             );

//             //per batch length
            
//             console.log(`${num} batch length :`, Object.keys(response.data.data).length);
//             num=num+1;
//             // Store the response data in the finalResponses object
//             Object.keys(response.data.data).forEach(key => {
//               finalResponses[key] = response.data.data[key];
//             });
//           } catch (error) {
//             if (error.response) {
//               console.log('Sending request with params:', { instrument_key: batch.join(',') });
//               console.error('API Response Error:', {
//                 status: error.response.status,
//                 statusText: error.response.statusText,
//                 data: error.response.data,
//               });
//             } else {
//               console.error('Axios Error:', error.message);
//             }
//           }
//         }

//         // Wait 1 second before processing the next set of 24 batches
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }

      
      
//         // console.log('First key-value pair:', Object.entries(finalResponses)[0]);

      
      
//       // console.log('Number of responses:', Object.keys(finalResponses).length);
//     } catch (error) {
//       console.error('Error in upstoxEqUpdates job:', error);
//     }
//   });
// }

// module.exports = upstoxEveryMinuteEqUpdates;




const cron = require('node-cron');
const db = require('../models/index.js');
const { sequelize } = db;
const axios = require('axios');

async function upstoxEveryMinuteEqUpdates() {
  let num = 1;
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

      let result = data[0][0].result;
      const batchSize = 80; // Each batch contains 80 tokens
      const maxBatchesPerSecond = 24; // Maximum of 24 batches sent sequentially per second
      let finalResponses = {};

      // The list of keys to remove
      const unwantedKeys = [
        "NSE_INDEX|HangSeng BeES-NAV",
        "NSE_INDEX|BHARATBOND-APR31",
        "NSE_INDEX|BHARATBOND-APR25",
        "NSE_INDEX|BHARATBOND-APR32",
        "NSE_INDEX|BHARATBOND-APR30",
        "NSE_INDEX|BHARATBOND-APR33"
      ];

      while (result.length > 0) {
        const currentBatches = result.splice(0, batchSize * maxBatchesPerSecond);

        // Process 24 batches sequentially within 1 second
        for (let i = 0; i < currentBatches.length; i += batchSize) {
          let batch = currentBatches.slice(i, i + batchSize);

          // Remove unwanted keys from the batch
          batch = batch.filter(key => !unwantedKeys.includes(key));

          if (batch.length === 0) {
            continue; // Skip if the batch is empty after filtering
          }

          try {
            const response = await axios.get(
              `https://api.upstox.com/v2/market-quote/quotes`,
              {
                params: { instrument_key: batch.join(',') },
                headers: {
                  'accept': 'application/json',
                  'Authorization': `Bearer ${process.env.UPSTOX_API_ACCESS_TOKEN}`,
                },
              }
            );

            console.log(`${num} batch length:`, Object.keys(response.data.data).length);
            num = num + 1;

            // Store the response data in the finalResponses object
            Object.keys(response.data.data).forEach(key => {
              finalResponses[key] = response.data.data[key];
            });
          } catch (error) {
            if (error.response) {
              console.log('Sending request with params:', { instrument_key: batch.join(',') });
              console.error('API Response Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              });
            } else {
              console.error('Axios Error:', error.message);
            }
          }
        }

        // Wait 1 second before processing the next set of 24 batches
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log('First key-value pair:', Object.entries(finalResponses)[0]);
      console.log('Number of responses:', Object.keys(finalResponses).length);

      await sequelize.query('CALL insert_data_upstox_nse_eq_prices(:jsonData)', {
        replacements: {
          jsonData: JSON.stringify(finalResponses), // Make sure this key matches the placeholder in the query
        },
        type: sequelize.QueryTypes.RAW,
        logging: false,
      });
      

      console.log('Database upstox insert_data_upstox_nse_eq_prices per minute job completed successfully.');
    } catch (error) {
      console.error('Error in upstoxEqUpdates job:', error);
    }
  });
}

module.exports = upstoxEveryMinuteEqUpdates;

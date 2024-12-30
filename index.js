// index.js
const app = require('./app'); 
const { KiteInstrument } = require('./models'); 
const KiteInstrumentFetchAndUpdateJob = require('./jobs/kite_instrument_fetch_update_job');  
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//declare jobs here 
KiteInstrumentFetchAndUpdateJob();

//declare table sync here 

// KiteInstrument.sync({ force: false })  // Use force: true if you want to drop and recreate the table
//   .then(() => {
//     console.log('Details table created or verified');
//   })
//   .catch((error) => {
//     console.error('Error syncing the model:', error);
//   });
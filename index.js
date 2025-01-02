// index.js
const app = require('./app'); 
const { kiteInstrument,upstoxInstrument } = require('./models'); 
const kiteInstrumentFetchAndUpdateJob = require('./jobs/kiteInstrumentFetchUpdate.job');  
const upstoxInstrumentFetchAndUpdateJob = require('./jobs/upstockInstrumentFetchUpdate.job');
const upstoxEveryMinuteEqUpdates = require('./jobs/upstoxEveryMinuteEqUpdates.job');
const PORT = process.env.PORT || 3000;
require('dotenv').config()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//declare jobs here 
// kiteInstrumentFetchAndUpdateJob();
// upstoxInstrumentFetchAndUpdateJob();
upstoxEveryMinuteEqUpdates()

//declare table sync here 

  kiteInstrument.sync({ force: false })  // Use force: true if you want to drop and recreate the table
  .then(() => {
    console.log('kiteInstrument table created or verified');
  })
  .catch((error) => {
    console.error('Error syncing the model:', error);
  });

  upstoxInstrument.sync({ force:  false })  // Use force: true if you want to drop and recreate the table
  .then(() => {
    console.log('upstoxInstrument table created or verified');
  })
  .catch((error) => {
    console.error('Error syncing the model:', error);
  });
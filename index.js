// index.js
const app = require('./app'); 
const { Details } = require('./models'); 
const fetchAndUpdateJob = require('./jobs/fetchAndUpdateJob');  
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

Details.sync({ force: false })  // Use force: true if you want to drop and recreate the table
  .then(() => {
    console.log('Details table created or verified');
  })
  .catch((error) => {
    console.error('Error syncing the model:', error);
  });
fetchAndUpdateJob();
// kiteInstrument.js
module.exports = (sequelize, DataTypes) => {
  const KiteInstrument = sequelize.define('KiteInstrument', {
    instrument_token: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey:true
    },
    exchange_token: {
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    tradingsymbol: {
      type: DataTypes.STRING(100), // Limit to 60 characters
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100), // Limit to 30 characters
      allowNull: true,
    },
    last_price: {
      type: DataTypes.FLOAT(10, 4), // 10 digits in total, 4 after the decimal point
      allowNull: true,
    },
    expiry: {
      type: DataTypes.STRING(50), 
      allowNull: true,
    },
    strike: {
      type: DataTypes.FLOAT(10, 4), // 10 digits in total, 2 after the decimal point
      allowNull: true,
    },
    tick_size: {
      type: DataTypes.FLOAT(5, 6), // 5 digits in total, 4 after the decimal point
      allowNull: true,
    },
    lot_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    instrument_type: {
      type: DataTypes.STRING(10), // Limit to 10 characters
      allowNull: true,
    },
    segment: {
      type: DataTypes.STRING(15), // Limit to 15 characters
      allowNull: true,
    },
    exchange: {
      type: DataTypes.STRING(10), // Limit to 10 characters
      allowNull: true,
    },
  }, {
    tableName: 'kite_instruments', // Set custom table name
    timestamps: true, // Disable createdAt and updatedAt
  });

  return KiteInstrument;
};

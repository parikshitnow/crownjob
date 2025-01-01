module.exports = (sequelize, DataTypes) => {
    const upstoxInstrument = sequelize.define(
      'upstoxInstrument',
      {
        instrument_key: {
          type: DataTypes.STRING(150),
          allowNull: true,
          primaryKey: false,
        },
        exchange_token: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        tradingsymbol: {
          type: DataTypes.STRING(150), // Limit to 150 characters
          allowNull: true,
        },
        name: {
          type: DataTypes.STRING(150), // Limit to 150 characters
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
          type: DataTypes.FLOAT(10, 4), // 10 digits in total, 4 after the decimal point
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
        option_type: {
          type: DataTypes.STRING(15), // Limit to 15 characters
          allowNull: true,
        },
        exchange: {
          type: DataTypes.STRING(10), // Limit to 10 characters
          allowNull: true,
        },
      },
      {
        tableName: 'upstox_instruments', // Set custom table name
        timestamps: true, // Enables createdAt and updatedAt columns
        createdAt: 'created_at', // Rename createdAt column to created_at
        updatedAt: false, // Disable updatedAt column if not needed
      }
    );
  
    return upstoxInstrument;
  };
    
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
        type: DataTypes.DECIMAL(12, 2), // Handles both integers and floats with precision
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
        type: DataTypes.DECIMAL(16, 6), // Handles both integers and floats with precision
        allowNull: true,
      },
      expiry: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      strike: {
        type: DataTypes.DECIMAL(16, 6), // Handles both integers and floats with precision
        allowNull: true,
      },
      tick_size: {
        type: DataTypes.DECIMAL(16, 6), // Handles both integers and floats with precision
        allowNull: true,
      },
      lot_size: {
        type: DataTypes.DECIMAL(12, 2), // Handles both integers and floats with precision
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



module.exports = (sequelize, DataTypes) => {
  const upstoxInstrument = sequelize.define(
    'upstoxInstrument',
    {
      instrument_key: {
        type: DataTypes.STRING(150),
        allowNull: true,
        primaryKey: false,  // We aren't setting this as primary key
      },
      exchange_token: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      tradingsymbol: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      last_price: {
        type: DataTypes.DECIMAL(16, 6),
        allowNull: true,
      },
      expiry: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      strike: {
        type: DataTypes.DECIMAL(16, 6),
        allowNull: true,
      },
      tick_size: {
        type: DataTypes.DECIMAL(16, 6),
        allowNull: true,
      },
      lot_size: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      instrument_type: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      option_type: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      exchange: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATEONLY, // Store only the date (no time)
        allowNull: false,
        defaultValue: DataTypes.NOW, // Default to the current date
      },
    },
    {
      tableName: 'upstox_instruments',
      timestamps: true, 
      createdAt: 'created_at',
      updatedAt: false, 
    }
  );



  return upstoxInstrument;
};

// details.js
module.exports = (sequelize, DataTypes) => {
    const Details = sequelize.define('Details', {
      instrument_token: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exchange_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tradingsymbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      expiry: {
        type: DataTypes.JSONB, // Allows any data type
        allowNull: true,
      },
      strike: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      tick_size: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lot_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      instrument_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      exchange: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
      timestamps: false, // Disable createdAt and updatedAt
    });
  
    return Details;
};

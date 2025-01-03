

module.exports=(sequelize,DataTypes)=>{
    const upstoxEqPrices=sequelize.define(
       'upstoxEqPrices',
       {
        symbol_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
            primaryKey: false, 
          },
          open: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
          },
          high:{
            type:DataTypes.DECIMAL(12,2),
            allowNull:true,
          },
          low:{
            type:DataTypes.DECIMAL(12,2),
            allowNull:true,
          },
          close:{
            type:DataTypes.DECIMAL(12,2),
            allowNull:true,
          },
          change:{
            type:DataTypes.DECIMAL(12,2),
            allowNull:true,
          },
          change_percent:{
            type:DataTypes.DECIMAL(12,2),
            allowNull:true,
          },
          last_trade_price:{
            type:DataTypes.DECIMAL(12,2),
            allowNull:true,
          },
          volume:{
            type:DataTypes.DECIMAL(12,2),
            allowNull:true,
          },
          time: {
            type: DataTypes.TIME, // Store the time in IST
            allowNull: false,
          }

       },
       {
        tableName: 'upstox_nse_eq_prices',
        timestamps: true,
        createdAt: 'created_at',
        allowNull:false,
        updatedAt: false,
      }
    )
    return upstoxEqPrices;
}
module.exports = (sequelize, Sequelize) => {
    const Cupon = sequelize.define("cupon", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
     },
      cupon: { type: Sequelize.STRING },
      vigencia: { type: Sequelize.STRING },
      estatus: { type: Sequelize. STRING },
      establecimiento: { type: Sequelize.STRING },
      serie: { type: Sequelize.STRING },
      canjes: { type: Sequelize.INTEGER },
      dotStatus: { type: Sequelize.STRING }
 });
    return Cupon;
};

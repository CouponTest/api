const models = require("../models");
const Cupon = models.cupon;

const request = require("request-promise-native");
const fs = require('fs');
const path = require("path");
const dir = "../krispy-api/assets";
const logsDir = "../krispy-api/logs";
const { v4: uuidv4 } = require('uuid');


exports.root = async (req, reply) => {
  reply.status(403).send();
}

/**
 * @coupon administration
 */

exports.createCoupon = async (req, reply) => {
  const rq = req.body; // JSON data received from the client
  console.log(rq);

  const cupon = {
    id: uuidv4(),
    cupon: rq.cupon,
    estatus: "Active",
    vigencia: rq.vigencia,
    establecimiento: rq.establecimiento,
    serie: rq.serie,
    dotStatus: "ActiveDot",
    canjes: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  const couponExist = await Cupon.findOne({ where: { cupon: rq.cupon } });
  if (couponExist === null) {
    console.log("Does not exist.");

    await Cupon.create(cupon).then(async response => {
      reply.status(200).send('OK - Created');
    });
  } else {
    console.log("Exists");
    reply.send(couponExist.cupon); 
  }
}


exports.useCoupon = async (req, reply) => {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();


  fs.writeFile(path.resolve(`${logsDir}/log-${year}-${month}-${date}.txt`), `Intento de Canje para Cupon: ${req.body.cupon} \nFecha: ${year}/${month}/${date} `, function() {
    console.log("Wrote to txt file");
  });
  
    const coupon = await Cupon.findOne({ where: { cupon: req.body.cupon } });
  const coupon = await Cupon.findOne({ where: { cupon: req.body.cupon } });
  if (!coupon) {
    reply.send({
      valid: false,
      reason: "Does not exist"
    });
  } else {
    var date = new Date();

  couponDate = new Date(coupon.vigencia);
  if(date < couponDate && coupon.estatus === "Active")
  {
    var update = await Cupon.update({ 
      estatus: "Used",
      dotStatus: "UsedDot"
    }, {
      where: {estatus: "Active", cupon: req.body.cupon, dotStatus: "ActiveDot"}
    })
    const form = {cupon: req.body.cupon};
    await request.post({
      url: 'http://localhost:4200/redeemTracker',
      form: form
    })
    reply.send({
      valid: true,
      reason: "Cupon validado exitosamente",
      establecimiento: coupon.establecimiento
    });
  }
  else {
    reply.send({
      valid: "false",
      reason: "Cupon invalido, ha sido usado o ha expirado."
    });
    const form = {cupon: req.body.cupon};
    await request.post({
      url: 'http://localhost:4200/redeemTracker',
      form: form
    });
  }
  }
  */
 reply.send()
}

exports.deactivateCoupon = async (req, reply) => {
  var update = await Cupon.update({ 
    estatus: "Deactivated",
    dotStatus: "DeactivatedDot"
  }, {
    where: {estatus: "Active", cupon: req.body.cupon, dotStatus: "ActiveDot"}
  })
  reply.send(update)
}
exports.deleteCoupon = async (req, reply) => {
  await Cupon.destroy({
    where: {
        cupon: req.body.cupon
    }
  });
  reply.send();
}
exports.redeemTracker = async (req, reply) => {
  const coupon = await Cupon.findOne({ where: { cupon: req.body.cupon } });
  await Cupon.update({ 
    canjes: coupon.canjes + 1
  }, {
    where: {cupon: req.body.cupon}
  })
  reply.send();
}
exports.getCoupons = async (req, reply) => {
  Cupon.findAll().then(async function(cupones) {
    reply.send(cupones)
  })
}
exports.getActiveCoupons = async (req, reply) => {
  const findActiveCoupons = await Cupon.findAll({ where: { estatus: "Active" } });
  reply.send(findActiveCoupons);
}
exports.getUsedCoupons = async (req, reply) => {
  const findUsedCoupons = await Cupon.findAll({ where: { estatus: "Used" } });
  reply.send(findUsedCoupons);
}

/**
 * @assets 
 */
exports.logo = async (req, reply) => {
  reply.sendFile(path.resolve(`${dir}/krispy-kreme-logo.png`));
}
exports.nav = async (req, reply) => {
  reply.sendFile(path.resolve(`${dir}/nav.css`));
}
/**
 * @development functions
 */

exports.clearCoupons = async (req, reply) => {
  Cupon.destroy({
    where: {},
    truncate: true
  });
  reply.end();
}



exports.excel = async (req, reply) => {
Promise.resolve(request.get('http://localhost:4200/get/coupons')).then(async response => {
  const object = new Object(response);
  const data = await JSON.parse(object)
  
    const Excel = require('exceljs');
  let workbook = new Excel.Workbook()

  let worksheet = workbook.addWorksheet('cupones')

  worksheet.columns = [
    {header: 'Cupon', key: 'cupon'},
    {header: 'Vigencia', key: 'vigencia'},
    {header: 'Estatus', key: 'estatus'},
    {header: 'Establecimiento', key: 'establecimiento'},
    {header: 'Serie', key: 'serie'},
    {header: 'Canjes', key: 'canjes'}
  ]

  // force the columns to be at least as long as their header row.
// Have to take this approach because ExcelJS doesn't have an autofit property.
worksheet.columns.forEach(column => {
  column.width = column.header.length < 12 ? 12 : column.header.length
})

// Make the header bold.
// Note: in Excel the rows are 1 based, meaning the first row is 1 instead of 0.
worksheet.getRow(1).font = {bold: true}


await data.forEach((e, index) => {
  // row 1 is the header.
  const rowIndex = index + 2

  // By using destructuring we can easily dump all of the data into the row without doing much
  // We can add formulas pretty easily by providing the formula property.
  worksheet.addRow({
    ...e,
    amountRemaining: {
      formula: `=C${rowIndex}-D${rowIndex}`
    },
    percentRemaining: {
      formula: `=E${rowIndex}/C${rowIndex}`
    }
  })
 })
 let date_ob = new Date();
 let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();

await workbook.xlsx.writeFile(`reports/reporte-${year}-${month}-${date}.xlsx`);
reply.send()
})
}

exports.reports = async (req, reply) => {
const files = [];
const directoryPath = path.resolve('../krispy-api/reports');
fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        files.push(file);
    });
 });
 reply.render("index")
}
exports.downloadReports = async (req, reply) => {
  const report = req.body.date;
  const file = path.resolve(`../krispy-api/reports/reporte-${report}.xlsx`);
  reply.download(file, file);
}
const { Router } = require("express");
const cors = require("cors");

const router = Router();

const _ = require("../controllers/main");

var whitelist = ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3001'];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } 
  } else {
    corsOptions = { origin: false } 
  }
  callback(null, corsOptions) 
}
router.get('/', _.root);
router.post('/createCoupon', cors(corsOptionsDelegate),_.createCoupon);
router.post('/deleteCoupon', cors(corsOptionsDelegate), _.deleteCoupon);
router.post('/useCoupon', cors(corsOptionsDelegate), _.useCoupon);
router.post('/deactivateCoupon', cors(corsOptionsDelegate), _.deactivateCoupon);
router.post('/redeemTracker', _.redeemTracker);
router.post('/excel', _.excel);
router.get('/get/coupons', cors(corsOptionsDelegate), _.getCoupons); // Returns all "coupons" on database
router.get('/get/usedCoupons', cors(corsOptionsDelegate), _.getUsedCoupons); // Returns all "used coupons" on database
router.get('/get/activeCoupons', cors(corsOptionsDelegate), _.getActiveCoupons); // Returns all "used coupons" on database
router.get('/reportes', _.reports);
router.post('/reporte', _.downloadReports);

/**
 * @assets endpoints
 */
router.get('/assets/logo', _.logo);
router.get('/assets/nav', _.nav);

/**
 * @development encpoints
 */
router.post('/destroy/coupons', _.clearCoupons); // Deletes all "coupons" on database
module.exports = router;
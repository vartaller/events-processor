var express = require('express');
var router = express.Router();

const rateService = require('../services/rate');

router.get('/', async function(req, res, next) {
  const date = req.query.date;
try {
  const data = await rateService.getAllCtrsByDate(date);
  res.json(data);
} catch (error) {
  next(error);
}
});

module.exports = router;

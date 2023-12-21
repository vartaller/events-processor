var express = require('express');
var router = express.Router();

const statisticsService = require('../services/statistics');

router.get('/', async function(req, res, next) {
    const { startDate, endDate } = req.query;
    try{
      const data = await statisticsService.getStatisticsForPeriod(startDate, endDate);
      res.json(data);
    }catch (error) {
      next(error);
    }
});

module.exports = router;

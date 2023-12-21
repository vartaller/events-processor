var createError = require('http-errors');
var express = require('express');

var indexRouter = require('./routes/index');
var rateRouter = require('./routes/rate');
var statisticsRouter = require('./routes/statistics');

var CustomError = require('./utils/custom-error')

var app = express();
const port = 3000

app.use(express.json());

app.use('/', indexRouter);
app.use('/rate', rateRouter);
app.use('/statistics', statisticsRouter);
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;

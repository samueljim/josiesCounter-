const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const chalk = require('chalk');
const statusMonitor = require('express-status-monitor')();
const path = require("path");
const schedule = require("node-schedule");
const Durry = require('./durry');

/**
 * Create Express server.
 */
const app = express();
app.use(compression());
app.use(statusMonitor);
app.set(
  "port",
  process.env.PORT_NUM ||
    process.env.PORT ||
    420
);

const durrybase = 'mongodb://admin:password@ds155299.mlab.com:55299/durrybase';

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(durrybase);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

app.use(express.static(__dirname + '/homePage'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
});

function updateDurry() {
  Durry.findOne({}).then((docs) => {
    if (docs.durryToday) {
      docs.daysWithout++;
      docs.durryToday = false;
      docs.save();
    } else {
      docs.daysWithout = 0;
      docs.save();
    }
    console.error('durry day update ', docs);
  }).catch((err) => {
    console.error(err);
  });
}

const j = schedule.scheduleJob("* * 0 * * *", updateDurry);

app.get('/durry', (req, res) => {
  Durry.findOne({}).then((docs) => {
    console.error(docs);
    return res.status(200).json(docs.daysWithout);
  }).catch((err) => {
    console.error(err);
  });
});

app.get('/nodurry', (req, res) => {
  res.redirect('/');
});

app.post('/', (req, res) => {
  Durry.findOne({}).then((docs) => {
      docs.durryToday = true;
      docs.save();
      console.error(docs);
    }).catch((err) => {
      console.error(err);
    });
  return res.status(200);
});

app.get('/newday', (req, res) => {
  updateDurry();
  res.redirect('/');
});

app.get('*', (req, res) => {
  res.status(404);
});


/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('\n%s %s mode', chalk.green('✓'), app.get('env'));
  console.log('%s App is running at http://localhost:%d', chalk.green('✓'), app.get('port'));
  console.log(chalk.red('Ⓒ Samuel Henry'));
});

module.exports = app;

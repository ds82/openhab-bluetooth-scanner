'use strict';

const http = require('http');
const url = require('url');

const chalk = require('chalk');
const noble = require('noble');
const config = require('./config.json');

const IDLE_UNTIL_REMOVE = 60 * 5;
const REMOVE_CHECK_INTERVAL = 5000;

const openhabURL = url.parse(config.openhab.url);
let db = {};

function getTimestamp() {
  return Math.floor(new Date() / 1000);
}

function touch(device) {
  db[device.uuid] = db[device.uuid] || {};
  let current = db[device.uuid];
  current.lastSeen = getTimestamp();
  current.uuid = device.uuid;
  current.address = device.address;
  current.present = current.present || false;
  enablePresent(current);
}

function enablePresent(device) {
  let item = getItemFromDevice(device);

  if (device.present !== true && item) {
    console.log(chalk.green('FOUND'), device.uuid, device.present, item);
    pushState(item, 'OPEN')
    .then(() => device.present = true)
    .catch(err => console.log(chalk.red('ERROR:'), err), device.present = false);
  } else if (!item && !device.unkown) {
    console.log(chalk.red('Found unkown device:'), device.uuid);
    device.unkown = true;
  }
}

function getItemFromDevice(device) {
  let current = config.beacons[(device.uuid)] || {};
  return current.item || false;
}

function pushState(item, state) {
  const isDataValid = (item && state !== undefined);

  return new Promise((resolve, reject) => {
    if (!isDataValid) {
      return reject('data invalid');
    }

    let thisRequest = Object.assign({}, openhabURL);

    thisRequest.path = `${openhabURL.path}rest/items/${item}/state`;
    thisRequest.method = 'PUT';

    thisRequest.headers = thisRequest.headers || {};
    thisRequest.headers['Content-Type'] = 'text/plain';
    // thisRequest.headers['Content-Length'] = Buffer.byteLength(state);

    //console.log(chalk.yellow('Make HTTP request..'), thisRequest, state);

    let req = http.request(thisRequest, res => {
      res.setEncoding('utf8');
      res.on('end', resolve);
    });
    req.write(state);
    req.end();
    resolve();
  });
}

function startRemoveCheck() {
  setInterval(() => {
    let devices = Object.keys(db);
    devices.forEach(device => {
      if (isIdle(device)) {
        let item = getItemFromDevice(device);
        pushState(item, 'CLOSED')
        .then(() => device.present = false);
      }
    });
  }, REMOVE_CHECK_INTERVAL);
}

function isIdle(device) {
  const now = getTimestamp();
  return (now - device.lastSeen) > IDLE_UNTIL_REMOVE;
}

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
    startRemoveCheck();
    console.log(chalk.green('Start scanning..'));
  } else {
    console.log('stateChange', state);
  }
});

noble.on('discover', peripheral => {
  // console.log(peripheral);
  touch(peripheral);
});

noble.on('warning', warning => console.log(chalk.yeollow(warning)));

#!/usr/bin/env node
'use strict'

const fs = require('fs');
const readline = require('readline');
const exec = require('child_process').exec;

const hostsFile = '/etc/hosts';
const startToken = '## start-gsd';
const endToken = '## end-gsd';
let hostsFileLines = [];
let hostLines = '';
let checkFirstComm = false;

const rl = readline.createInterface({
  input: fs.createReadStream(hostsFile)
});


var param = process.argv[2];

function gsd (param) {
    return param === 'work' ? addToHosts() : param === 'play' ? removeFromHosts() : console.log('Please insert an argument');
}

function restartNetwork() {
    if (process.platform === 'linux') {
        exec('/etc/init.d/networking restart', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);

          if (stderr) console.log(`stderr: ${stderr}`);
        });
    }
}

function addToHosts() {
    rl.on('line', (line) => {
        hostsFileLines.push(line);
    });

    rl.on('close', (line) => {
        if (hostsFileLines[hostsFileLines.length - 1] == endToken) {
            return console.log('You have already appended to hosts file');
        }
        writeToHosts();
        restartNetwork();
    });
}

function removeFromHosts() {
    rl.on('line', (line) => {
        if (line === startToken) {
            checkFirstComm = true;
        }
        if (!checkFirstComm) {
            hostsFileLines.push(line);
        }
    });

    rl.on('close', (line) => {
        for (let host of hostsFileLines) {
        	hostLines += `${host}\n`;
        }

        fs.writeFile(hostsFile, hostLines, function (err) {
          if (err) throw err;
        });

        restartNetwork();
    });
}

var writeToHosts = function writeToHosts() {

    fs.readFile('sites.ini', 'utf8', function (err,data) {
      if (err) throw err;
      const sites = data.match(/[^=]+$/)[0].split(', ');

      hostLines += startToken + '\n';

      for (let site of sites) {
      	hostLines += `127.0.0.1 ${site}\n`;
      	hostLines += `127.0.0.1 www.${site}\n`;
      }

      hostLines += endToken + '\n';

      fs.appendFile(hostsFile, hostLines, function (err) {
        if (err) throw err;
      });
    });
}

gsd(param);

'use strict'
const os = require('os');
const fs = require('fs');
const readline = require('readline');
const exec = require('child_process').exec;
const { sites } = require('./sites.json');

const hostsFile = '/etc/hosts';
const startToken = '## start-gsd';
const endToken = '## end-gsd';
let hostsFileLines = [];
let hostLines = '';
let checkFirstComm = false;

const rl = readline.createInterface({
  input: fs.createReadStream(hostsFile)
});

const param = process.argv[2];

const isRootUser = os.userInfo().username === 'root';

const gsd = param => {
    switch(param) {
        case 'work' : { 
            return addToHosts()
        }
        case 'play' : { 
            return removeFromHosts()
        }
        default : return console.log('Please insert an argument: work or play');
    }
}

const restartNetwork = () => {
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

const addToHosts = () => {
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

const removeFromHosts = () => {
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

const writeToHosts = () => {
    hostLines += startToken + '\n';

    for (let site of sites) {
    hostLines += `127.0.0.1 ${site}\n`;
    hostLines += `127.0.0.1 www.${site}\n`;
    }

    hostLines += endToken + '\n';

    fs.appendFile(hostsFile, hostLines, function (err) {
        if (err) throw err;
    });
}

isRootUser ? gsd(param) : console.log('Run again with sudo user')

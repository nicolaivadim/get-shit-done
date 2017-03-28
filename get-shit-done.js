#!/usr/bin/env node
'use strict'

const fs = require('fs');
const readline = require('readline');

const hostsFile = '/etc/hosts';
const startToken = '## start-gsd\n';
const endToken = '## end-gsd';
let hostComments = '';

const rl = readline.createInterface({
  input: fs.createReadStream(hostsFile)
});

rl.on('line', (line) => {
	if (line === endToken) {
	  console.log(`Line from file: ${line}`);
	}
});

fs.readFile('sites.ini', 'utf8', function (err,data) {
  if (err) throw err;
  const sites = data.match(/[^=]+$/)[0].split(', ');
  
  hostComments += startToken;
  
  for (let site of sites) {  	
  	hostComments += `127.0.0.1 ${site}\n`;
  	hostComments += `127.0.0.1 www.${site}\n`;
  }

  hostComments += endToken;

	fs.appendFile('message.txt', hostComments, function (err) {
		console.log(hostComments);
	  if (err) throw err;
	  console.log('Saved!');
	});
});

#!/usr/bin/env node
// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var Parser = require('posix-getopt').BasicParser;
var extract = require('../lib/extract');
var fs = require('fs');
var helper = require('../lib/helper');
var lint = require('../lib/lint');
var path = require('path');
var translate = require('../lib/translate');

function printHelp($0, prn) {
  var USAGE = fs.readFileSync(require.resolve('./slt-globalize.txt'), 'utf-8')
    .replace(/%MAIN%/g, $0)
    .trim();

  prn(USAGE);
}

function main(argv, callback) {
  callback = callback || function() {};

  var parser = new Parser([':',
    'd(deepextract)',
    'e(extract)',
    'h(help)',
    'l(lint)',
    't(translate)',
    'v(version)',
  ].join(''), argv);

  var option;
  var cmd;
  var blackList = [];
  var $0 = process.env.CMD ? process.env.CMD : path.basename(argv[1]);
  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        console.log(require('../package.json').version);
        return callback();
      case 'h':
        printHelp($0, console.log);
        return callback();
      case 'd':
      case 'e':
        cmd = option.option;
        // slt-global -e vendor node_modules
        if (process.argv.length > parser.optind()) {
          for (var i = parser.optind(); i < process.argv.length; i++) {
            blackList.push(process.argv[i]);
          }
        }
        break;
      case 'l':
        cmd = option.option;
        break;
      case 't':
        cmd = option.option;
        break;
      default:
        console.error('Invalid usage (near option \'%s\'), try `%s --help`.',
          option.optopt, $0);
        return callback(true);
    }
  }

  if (cmd !== 'd' && cmd !== 'e' && parser.optind() !== argv.length) {
    console.error('Invalid usage (extra arguments), try `%s --help`.', $0);
    return callback(true);
  }

  helper.initGlobForSltGlobalize();

  if (cmd === 't') {
    translate.translateResource(function(err, result) {
      return callback(err);
    });
  }

  if (cmd === 'l') {
    lint.lintMessageFiles(false, function(err, result) {
      return callback(err);
    });
  }

  if (cmd === 'e') {
    extract.extractMessages(blackList, false, false, function(err, result) {
      return callback(err);
    });
  }

  if (cmd === 'd') {
    extract.extractMessages(blackList, true, false, function(err, result) {
      return callback(err);
    });
  }

  if (cmd === undefined) {
    printHelp($0, console.log);
    return callback();
  }

}

main(process.argv, function(err) {
  if (err) process.exit(1);
});

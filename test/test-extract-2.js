// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var extract = require('../lib/extract');
var sltTH = require('./slt-test-helper')
var test = require('tap').test;

var targets = {
  extract000: {
    out: [
      '--- cloned /node_modules/gsub/intl/en/gsub.txt\n',
      '*** non-literal argument and skipped: g.log\n',
      '*** non-literal argument and skipped: g.log\n',
      '    extracted: User name is %s.\n',
      '    extracted: user: %s\n',
      '\n--- root: \n--- max depth: unlimited\n--- cloned: 1 txt\n' +
        '--- scanned: 2 js, 0 html \n--- skipped: 0 js, 0 html \n' +
        '--- extracted: 2 msges, 6 words, 26 characters\n',
      ],
    err: [
    ],
  },
  extract001: {
    out: [
      '*** non-literal argument and skipped: g.log\n',
      '*** non-literal argument and skipped: g.log\n',
      '    extracted: User name is %s.\n',
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n' +
        '--- scanned: 1 js, 0 html \n--- skipped: 0 js, 0 html \n' +
        '--- extracted: 1 msges, 4 words, 17 characters\n',
      ],
    err: [
    ],
  },
  extract002: {
    out: [
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n' +
        '--- scanned: 1 js, 0 html \n--- skipped: 1 js, 0 html \n' +
        '--- extracted: 0 msges, 0 words, 0 characters\n',
      ],
    err: [
    ],
  },
  extract003: {
    out: [
      '--- cloned /node_modules/gsub/intl/en/gsub.txt\n',
      '*** non-literal argument and skipped: g.log\n',
      '*** non-literal argument and skipped: g.log\n',
      '    extracted: User name is %s.\n',
      '    extracted: user: %s\n',
      '\n--- root: \n--- max depth: unlimited\n--- cloned: 1 txt\n' +
        '--- scanned: 2 js, 0 html \n--- skipped: 0 js, 0 html \n' +
        '--- extracted: 2 msges, 6 words, 26 characters\n',
      ],
    err: [
    ],
  },
  extract004: {
    out: [
      '*** non-literal argument and skipped: g.log\n',
      '*** non-literal argument and skipped: g.log\n',
      '    extracted: User name is %s.\n',
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n' +
        '--- scanned: 1 js, 0 html \n--- skipped: 0 js, 0 html \n' +
        '--- extracted: 1 msges, 4 words, 17 characters\n',
      ],
    err: [
    ],
  },
};

test('test extract misc testing', function(t) {
  sltTH.testHarness(t, targets, false,
      function(name, unhook_intercept, callback) {
    var blackList = null;
    var deep = (name === 'extract000' || name === 'extract003');
    var suppressOutput = false;
    extract.extractMessages(blackList, deep, suppressOutput,
      function(err) {
        unhook_intercept();
        callback();
      }
    );
  });
});

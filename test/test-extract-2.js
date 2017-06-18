// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var extract = require('../lib/extract');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  extract000: {
    out: [
      '--- cloned /node_modules/gsub/intl/en/gsub.txt\n',
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
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
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
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
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
      '    extracted: User name is %s.\n',
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n' +
        '--- scanned: 1 js, 0 html \n--- skipped: 0 js, 0 html \n' +
        '--- extracted: 1 msges, 4 words, 17 characters\n',
    ],
    err: [
    ],
  },
  extract003: {
    out: [
      '--- cloned /node_modules/gsub/intl/en/gsub.txt\n',
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
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
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
      /^[\*]{3} Skipped non-literal argument of "g\.log" at /,
      '    extracted: User name is %s.\n',
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n' +
        '--- scanned: 1 js, 0 html \n--- skipped: 0 js, 0 html \n' +
        '--- extracted: 1 msges, 4 words, 17 characters\n',
    ],
    err: [
    ],
  },
  extract005: {
    out: [
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n' +
        '--- scanned: 1 js, 0 html \n--- skipped: 1 js, 0 html \n' +
        '--- extracted: 0 msges, 0 words, 0 characters\n',
    ],
    err: [
      new RegExp('^\n[\*]{58}\n' +
        '[\*]{2} Please fix the JS code or blacklist the directory\.\n' +
        '[\*]{2} \/index\.js\n' +
        '[\*]{2} \{\"index\":[0-9]{3},\"lineNumber\":8,' +
        '\"description\":\"Illegal return statement\"' + '\}\n' +
        '[\*]{58}\n\n$'),
    ],
  },
  extract012: {
    out: [
      '*** Skipped non-literal argument of "g.log" at /index.js:9\n',
      '    extracted: part2\n',
      '    extracted: part1\n',
      '    extracted: paragraph content of class strong-globalize\n',
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n' +
      '--- scanned: 1 js, 1 html \n--- skipped: 0 js, 0 html \n' +
      '--- extracted: 3 msges, 8 words, 53 characters\n',
    ],
    err: [
    ],
  },
};

test('test extract misc testing', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, checkResults) {
      var blackList = (name === 'extract000') ? 'foo.js' : null;
      var deep = (name === 'extract000' || name === 'extract003');
      var suppressOutput = false;
      extract.extractMessages(blackList, deep, suppressOutput,
        function(_err) {
          unhook_intercept();
          t.notOk(_err, 'extractMessages succeeds.');
          checkResults();
        });
    }, function() {
      t.end();
    });
});

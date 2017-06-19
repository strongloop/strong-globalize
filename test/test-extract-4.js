// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var extract = require('../lib/extract');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  extract014: {
    out: [
      '--- cloned /node_modules/gsub/intl/en/gsub1.txt\n',
      '--- cloned /node_modules/gsub/intl/en/gsub2.txt\n',
      '--- cloned /node_modules/gsub/intl/en/gsub3.txt\n',
      '--- removed /intl/en/0a843e6d95df937ebc3f5cca3bf9a919_gsub2.txt\n',
      '--- removed /intl/en/a5357f3f1d93bb2f4677a0e79dd6ce3d_gsub1.txt\n',
      '    extracted: User name is %s.\n',
      new RegExp('^\n[-]{3} root: \n[-]{3} max depth: unlimited' +
        '\n[-]{3} cloned: 3 txt' +
        '\n[-]{3} scanned: [23]{1} js, 0 html ' +
        '\n[-]{3} skipped: 0 js, 0 html ' +
        '\n[-]{3} extracted: 1 msges, 4 words, 17 characters\n'),
    ],
    err: [
    ],
  },
};

test('test extract misc cases 3', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, checkResults) {
      var blackList = null;
      var deep = (name === 'extract014');
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

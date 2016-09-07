// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var extract = require('../lib/extract');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  'extract-shared-globalize': {
    out: [
      '    extracted: text from index.js\n',
      '\n--- root: \n' +
      '--- max depth: unlimited\n' +
      '--- cloned: 0 txt\n' +
      '--- scanned: 2 js, 0 html \n' +
      '--- skipped: 0 js, 0 html \n' +
      '--- extracted: 1 msges, 4 words, 18 characters\n',
    ],
    err: [
    ],
  },
};

test('test extract from project using shared globalize module', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, checkResults) {
      var blackList = null;
      var deep = true;
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

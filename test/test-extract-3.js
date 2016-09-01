// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var extract = require('../lib/extract');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  extract013: {
    out: [
      '--- cloned /node_modules/mydependency/intl/en/longtext.txt\n',
      '    extracted: additional message\n',
      new RegExp('^\n[-]{3} root: \n[-]{3} max depth: unlimited' +
        '\n[-]{3} cloned: 1 txt' +
        '\n[-]{3} scanned: [23]{1} js, 0 html ' +
        '\n[-]{3} skipped: 0 js, 0 html ' +
        '\n[-]{3} extracted: 1 msges, 2 words, 18 characters\n'),
    ],
    err: [
    ],
  },
};

test('test extract misc cases 2', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, checkResults) {
      var blackList = null;
      var deep = (name === 'extract013');
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

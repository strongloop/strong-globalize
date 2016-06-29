// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var extract = require('../lib/extract');
var helper = require('../lib/helper');
var sltTH = require('./slt-test-helper')
var test = require('tap').test;

var targets = {
  extract006: {
    out: [
      '    extracted: warn\n',
      '    extracted: ewrite\n',
      '    extracted: This is an error.\n',
      '    extracted: info\n',
      '    extracted: error\n',
      '    extracted: log\n',
      '    extracted: owrite\n',
      '    extracted: write\n',
      '\n--- root: \n--- max depth: N/A\n--- cloned: N/A\n--- scanned: 1 js,' +
        ' 0 html \n--- skipped: 0 js, 0 html \n--- extracted: 8 msges,' +
        ' 11 words, 50 characters\n',
    ],
    err: [
    ],
  },
};

// extract006 ---> JSON
// extract007 ---> YAML
// results should be exactly the same
targets.extract007 = targets.extract006;

test('test extract msges from json file', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, callback) {
      var blackList = null;
      var deep = false;
      var suppressOutput = false;
      extract.extractMessages(blackList, deep, suppressOutput,
        function(err) {
          unhook_intercept();
          callback();
        });
    }, function() {
      t.end();
    });
});

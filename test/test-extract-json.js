// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var extract = require('../lib/extract');
var sltTH = require('./slt-test-helper');
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
  extract009: {
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
      '*** json read failure:  /data/dataNonExistent.json *** defined in:' +
        '  /index.js\n',
      '*** key array parse failure:  undefined *** defined in:  /index.js\n',
      '*** key array parse failure:  [[][ *** defined in:  /index.js\n',
    ],
  },
};

// extract006, 9 ---> JSON
// extract007, 10 ---> YML
// extract008, 11 ---> YAML
// success cases: results should be exactly the same
targets.extract008 = targets.extract007 = targets.extract006;
// failure cases: ditto except for the file name trailer
var extract009Str = JSON.stringify(targets.extract009);
targets.extract010 = JSON.parse(extract009Str);
targets.extract011 = JSON.parse(extract009Str);
var r = new RegExp('json', 'g');
targets.extract010.err[0] = targets.extract010.err[0].replace(r, 'yml');
targets.extract011.err[0] = targets.extract011.err[0].replace(r, 'yaml');

test('test extract msges from json file', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, callback) {
      var blackList = null;
      var deep = false;
      var suppressOutput = false;
      extract.extractMessages(blackList, deep, suppressOutput,
        function(_err) {
          unhook_intercept();
          callback();
        });
    }, function() {
      t.end();
    });
});

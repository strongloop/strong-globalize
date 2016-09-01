// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var globalize = require('../lib/globalize');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  packmessage: {
    out: [
      'help.txt arg1 arg2\n',
      'help.txt arg3 arg4\n',
      'null undefined\n',
    ],
    err: [
    ],
  },
};
test('test pack message', function(t) {
  sltTH.testHarness(t, targets, true,
    function(name, unhook_intercept, callback) {
      globalize.packMessage(['help.txt', 'arg1', 'arg2'], console.log);
      console.log(globalize.packMessage(['help.txt', 'arg3', 'arg4']));
      globalize.packMessage(['%s %s', null, undefined], console.log);
      unhook_intercept();
      callback();
    }, function() {
      t.end();
    });
});

// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var helper = require('../lib/helper');
var sltTH = require('./slt-test-helper');
var path = require('path');
var test = require('tap').test;

var targets = {
  setdir000: {
    out: [
    ],
    err: [
      '*** setRootDir: Root path invalid: nonexistent-dir\n',
    ],
  },
  setdir001: {
    out: [
    ],
    err: [
      /^[\*]{3} setRootDir: Intl dir not found under: /,
    ],
  },
  setdir002: {
    out: [
    ],
    err: [
      /^[\*]{3} setRootDir: Root path is not a directory: /,
    ],
  },
};
test('setRootDir test', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, callback) {
      switch (name) {
        case 'setdir000': {
          try {
            helper.setRootDir('nonexistent-dir');
          } catch (e) {
            console.error(e.message);
          }
          unhook_intercept();
          callback();
          break;
        }
        case 'setdir001': {
          try {
            helper.setRootDir(path.join(process.cwd(), '..'));
          } catch (e) {
            console.error(e.message);
          }
          unhook_intercept();
          callback();
          break;
        }
        case 'setdir002': {
          try {
            helper.setRootDir(__filename);
          } catch (e) {
            console.error(e.message);
          }
          unhook_intercept();
          callback();
          break;
        }
        default: {
          unhook_intercept();
          callback();
          break;
        }
      }
    }, function() {
      t.end();
    });
});

test('headerIncluded in string', function(t) {
  t.assert(helper.headerIncluded('name', 'name'));
  t.end();
});


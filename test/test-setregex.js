// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var extract = require('../lib/extract');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  setregex000: {
    out: [
    ],
    err: [
      /["]{0,1}undefined["]{0,1} == true\n/,
    ],
  },
  setregex001: {
    out: [
    ],
    err: [
      '*** setHtmlRegex: \'regex\' is illegal.\n',
    ],
  },
  setregex002: {
    out: [
    ],
    err: [
      '*** setHtmlRegex: \'regexHead\' is illegal.\n',
    ],
  },
  setregex003: {
    out: [
    ],
    err: [
      '*** setHtmlRegex: \'regexTail\' is illegal.\n',
    ],
  },
};
test('setHtmlRegex test', function(t) {
  sltTH.testHarness(t, targets, true,
    function(name, unhook_intercept, callback) {
      switch (name) {
        case 'setregex000': {
          try {
            extract.setHtmlRegex();
          } catch (e) {
            console.error(e.message);
          }
          break;
        }
        case 'setregex001': {
          try {
            extract.setHtmlRegex('^^^');
          } catch (e) {
            console.error(e.message);
          }
          break;
        }
        case 'setregex002': {
          try {
            extract.setHtmlRegex(/^.$/, '^^^');
          } catch (e) {
            console.error(e.message);
          }
          break;
        }
        case 'setregex003': {
          try {
            extract.setHtmlRegex(/^.$/, /^.$/, '^^^');
          } catch (e) {
            console.error(e.message);
          }
          break;
        }
        default: {
          break;
        }
      }
      unhook_intercept();
      callback();
    }, function() {
      t.end();
    });
});

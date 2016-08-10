// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  formatMessage: {
    out: [
    ],
    err: [
    ],
  },
  formatNumber: {
    out: [
    ],
    err: [
    ],
  },
  formatDate: {
    out: [
    ],
    err: [
    ],
  },
  formatCurrency: {
    out: [
    ],
    err: [
    ],
  },
};

test('test globalize misc testing', function(t) {
  sltTH.testHarness(t, targets, true,
      function(name, unhook_intercept, callback) {
        unhook_intercept();
        callback();
        var g = SG();
        var target;
        var found;
        switch (name) {
          case 'formatMessage':
            target = 'invalidMessage abc xyz';
            found = g.formatMessage('invalidMessage', ['abc', 'xyz']);
            t.match(found, target, target);
            break;
          case 'formatNumber':
            target = 'wrongNumber';
            found = g.formatNumber(target);
            t.match(found, target, target);
            break;
          case 'formatDate':
            target = 'wrongDate';
            found = g.formatDate(target);
            t.match(found, target, target);
            break;
          case 'formatCurrency':
            target = 'invalidCurrencySymbol100';
            found = g.formatCurrency(100, 'invalidCurrencySymbol');
            t.match(found, target, target);
            break;
          default:
        }
      }, function() {
        t.end();
      });
});

// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var sltTH = require('./slt-test-helper')
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
    var g = SG();
    switch (name) {
      case 'formatMessage':
        var target = 'invalidMessage abc xyz';
        var found = g.formatMessage('invalidMessage', ['abc', 'xyz']);
        t.equal(found, target, target);
        break;
      case 'formatNumber':
        var target = 'wrongNumber';
        var found = g.formatNumber(target);
        t.equal(found, target, target);
        break;
      case 'formatDate':
        var target = 'wrongDate';
        var found = g.formatDate(target);
        t.equal(found, target, target);
        break;
      case 'formatCurrency':
        var target = 'invalidCurrencySymbol100';
        var found = g.formatCurrency(100, 'invalidCurrencySymbol');
        t.equal(found, target, target);
        break;
      default:
    }
    unhook_intercept();
    callback();
  });
});

// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var helper = require('../lib/helper');
var test = require('tap').test;

var outOfOrder = {
  fed: 'fed',
  msg123: 'msg 1234',
  abc: 'abc',
  123: '123',
  msgXyz: 'msg xyz',
  xyz: 'xyz',
};

var inOrder = {
  123: '123',
  abc: 'abc',
  fed: 'fed',
  xyz: 'xyz',
  msg123: 'msg 1234',
  msgXyz: 'msg xyz',
};

var unintendedOrder = {
  123: '123',
  abc: 'abc',
  fed: 'fed',
  msg123: 'msg 1234',
  msgXyz: 'msg xyz',
  xyz: 'xyz',
};

test('check equality of message objects', function(t) {
  var result = helper.sortMsges(outOfOrder);
  t.match(result, outOfOrder,
    'result contents are intact - outOfOrder.');
  t.match(result, inOrder,
    'result contents are intact - inOrder.');
  t.match(result, unintendedOrder,
    'result contents are intact - unintendedOrder.');
  t.match(Object.keys(result), Object.keys(inOrder),
    'keys are correctly sorted.');
  t.match(Object.keys(outOfOrder).sort(), Object.keys(unintendedOrder),
    'apparently correct, but unintended sort order.');
  t.notMatch(Object.keys(result), Object.keys(unintendedOrder),
    'fails on the unintended order.');
  t.end();
});

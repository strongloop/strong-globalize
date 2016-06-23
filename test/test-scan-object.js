// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var helper = require('../lib/helper');
var path = require('path');
var test = require('tap').test;

var data = {
  a: {
    a1: 'text a1',
    a2: 'text a2',
    a3: 3,
  },
  b: [
    [7, 8, 9],
    'b one',
    2,
    {
      b4: 'text b4',
    },
  ],
  c: {
    d: {
      e: 'text e',
    }
  },
  f: 'text f',
};


var keys = [
  ['a', 'a2'],
  ['b', 0],
  ['b', 1],
  ['b', 4, 'b4'],
  ['h', 'd'],
  ['h'],
  ['c', 'd', 'e'],
  ['f', 'g'],
  ['f', 0],
];

var longExpected = [
  'text a2',
  '*** not a string value ["b",0]',
  'b one',
  '*** TypeError: Cannot read property \'b4\' of undefined' +
    ' ["b",4,"b4"]',
  '*** TypeError: Cannot read property \'d\' of undefined' +
    ' ["h","d"]',
  '*** not a string value ["h"]',
  'text e',
  '*** unexpected string value ["f","g"]',
  '*** unexpected string value ["f",0]',
];

var shortExpected = [
  'text a2',
  'b one',
  'text e',
];

function testScan(returnErrors) {
  var ret = helper.scanJson(keys, data, returnErrors);
  var exptd = returnErrors ? longExpected : shortExpected;
  test('object scan object with' + (returnErrors ? '' : 'out') + ' errors',
    function(t) {
    t.match(ret.length, exptd.length,
      'return length matched.');
    exptd.forEach(function(exp, ix) {
      t.match(ret[ix], exp,
        'right text is returned ' + ix.toString());
    })
    t.end();
  });
}

testScan(false);
testScan(true);

var newKeys = [
  ['a', 'a2'],
  ['b', 1],
  ['c', 'd', 'e'],
];

var newData = [
  'new text a2',
  'new b one',
  'new text e',
];

var replacedData = {
  a: {
    a1: 'text a1',
    a2: 'new text a2',
    a3: 3,
  },
  b: [
    [7, 8, 9],
    'new b one',
    2,
    {
      b4: 'text b4',
    },
  ],
  c: {
    d: {
      e: 'new text e',
    }
  },
  f: 'text f',
};

function testReplace() {
  var ret = helper.replaceJson(newKeys, data, newData);
  test('replace object', function(t) {
    t.match(JSON.stringify(ret), JSON.stringify(replacedData),
      'successfully replaced object.');
    t.end();
  });
}

testReplace();

function testFormatObj() {
  var SG = require('../index');
  var g = SG();
  test('g.t with partial path', function(t) {
    t.throws(function() {
      g.t('scanObjTest.json', newKeys);
    }, 'full path is required.');
    t.end();
  });
  test('g.t with full path and no replacement', function(t) {
    var ret = null;
    t.doesNotThrow(function() {
      ret = g.t(path.resolve(__dirname, 'fixtures', 'scanObjTest.json'),
       newKeys);
    }, 'full path is required.');
    t.match(JSON.stringify(ret), JSON.stringify(replacedData),
      'round trip object works');
    t.end();
  });
}

testFormatObj();

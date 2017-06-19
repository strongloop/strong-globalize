// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var helper = require('../lib/helper');
var test = require('tap').test;

var savedConsoleLog = console.log;
var savedConsoleError = console.error;
console.log = function() {};
console.error = function() {};

test('normalize keys', function(t) {
  var data = [
    {
      i: null,
      o: [],
    },
    {
      i: '',
      o: [],
    },
    {
      i: [],
      o: [],
    },
    {
      i: [''],
      o: [],
    },
    {
      i: 'key-text',
      o: [
        ['key-text'],
      ],
    },
    {
      i: 1,
      o: [
        ['1'],
      ],
    },
    {
      i: [2],
      o: [
        ['2'],
      ],
    },
    {
      i: [
        3,
        'a',
        [4],
      ],
      o: [
        ['3'],
        ['a'],
        ['4'],
      ],
    },
    {
      i: [
        [5, 'b'],
        ['c'],
        null,
      ],
      o: [
        ['5', 'b'],
        ['c'],
      ],
    },
  ];

  var x = {a: [{b: 'yes'}]};
  t.match(x.a[0].b, 'yes', 'JS notation remark 1');
  t.match(x.a['0'].b, 'yes', 'JS notation remark 2');

  for (var ix = 0; ix < data.length; ix++) {
    var i = data[ix].i;
    var o = data[ix].o;
    // console.log(helper.normalizeKeyArrays(i), o);
    t.match(helper.normalizeKeyArrays(i), o,
      'normalize keys with data number: ' + ix.toString());
  }
  t.throws(function() {
    helper.normalizeKeyArrays([[[]]]);
  }, 'key must be string or number');
  t.end();
});

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
    },
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
  '*** not a string value ["b","0"]',
  'b one',
  '*** TypeError: Cannot read property \'b4\' of undefined' +
    ' ["b","4","b4"]',
  '*** TypeError: Cannot read property \'d\' of undefined' +
    ' ["h","d"]',
  '*** not a string value ["h"]',
  'text e',
  '*** unexpected string value ["f","g"]',
  '*** unexpected string value ["f","0"]',
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
      });
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
    },
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

console.log = savedConsoleLog;
console.error = savedConsoleError;

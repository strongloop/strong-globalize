// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var lint = require('../lib/lint');
var test = require('tap').test;

SG.SetRootDir(__dirname);

test('lint message', function(t) {
  lint.lintMessageFiles(false, function(err) {
    t.assert(!err, 'No lint errors.');
  });
  t.end();
});

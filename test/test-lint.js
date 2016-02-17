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

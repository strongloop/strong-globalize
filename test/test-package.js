var test = require('tap').test;
var pkg;

test('package.json', function(t) {
  t.doesNotThrow(function() {
    pkg = require('../package.json');
  });
  t.end();
});

test('deps', function(t) {
  var deps = Object.keys(pkg.dependencies);
  t.assert(deps.length > 0, 'has dependencies');
  deps.forEach(function(dep) {
    t.doesNotThrow(function() {
      require.resolve(dep);
    }, dep + ' is installed');
  });
  t.end();
});

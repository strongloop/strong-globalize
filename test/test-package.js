// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var test = require('tap').test;
var pkg;
var nodeVersion = process.version.replace(
  /(^v[0-9]+\.[0-9]+)\.[0-9]+$/, '$1');

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
    if (dep === 'node-zlib-backport') {
      if (nodeVersion === 'v0.10') {
        t.doesNotThrow(function() {
          require.resolve(dep);
        }, dep + ' is installed');
      } else {
        t.throws(function() {
          require.resolve(dep);
        }, dep + ' cannot be installed');
      }
    } else {
      t.doesNotThrow(function() {
        require.resolve(dep);
      }, dep + ' is installed');
    }
  });
  t.end();
});

var f = require('util').format;
var g = require('../lib/globalize');

// The data was gathered by running (some) unit-tests of LoopBack
var data = require('./data/loopback-sample-messages.json');

var size = data.length;
var baseline = measure(function format(args) { f.apply(this, args); });
console.log('%s calls of "util.format()" took %s milliseconds', size, baseline);

var duration = measure(function localize(args) { g.f.apply(g, args); });
console.log('%s calls of "g.f()" took %s milliseconds', size, duration);

var ratio = Math.ceil(duration / baseline);
console.log('g.f() is %sx slower than util.format', ratio);

function measure(fn) {
  var start = process.hrtime();
  for (var run = 0; run < 5; run++) {
    data.forEach(function(args) {
      fn(args);
    });
  }
  var delta = process.hrtime(start);
  return delta[0] * 1e3 + delta[1] / 1e6;
}

// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var helper = require('../lib/helper');
var path = require('path');
var sltTH = require('./slt-test-helper')
var test = require('tap').test;

var targets = {
  cldrv010: {
    out: [
      'file: /cldr/fake_cldr.json exists. , content: fake cldr content\n',
      'file: /cldr/fake_cldr2.json exists. , content: fake cldr content\n',
    ],
    err: [
    ],
  },
  cldrv4: {
    out: [
      'file: /cldr/fake_cldr.gz exists. , content: fake cldr content\n',
      'file: /cldr/fake_cldr2.gz exists. , content: fake cldr content\n',
    ],
    err: [
    ],
  },
  cldrv6: {
    out: [
      'file: /cldr/fake_cldr.gz exists. , content: fake cldr content\n',
      'file: /cldr/fake_cldr2.gz exists. , content: fake cldr content\n',
    ],
    err: [
    ],
  },
};
test('test cldr set up', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, callback) {
      var fileTypesToRemove =
        (name === 'cldrv010') ? 'gz' : 'json';
      var cldrPath = path.join(helper.getRootDir(), 'cldr');
      helper.removeRedundantCldrFiles(cldrPath, fileTypesToRemove);
      helper.enumerateFilesSync(cldrPath, null, fileTypesToRemove,
        false, false, function(content, filePath) {
          console.error('file: %s should not exist.', filePath);
        });
      var fileTypesToRetain =
        (name === 'cldrv010') ? 'json' : 'gz';
      helper.enumerateFilesSync(cldrPath, null, fileTypesToRetain,
        false, false, function(content, filePath) {
          console.log('file: %s exists.', filePath,
            ', content:', content.toString());
        });
      unhook_intercept();
      callback();
    }, function() {
      t.end();
    });
});

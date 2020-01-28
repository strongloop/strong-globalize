// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: strong-globalize-cli
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var SG = require('strong-globalize');
var helper = SG.helper;
var test = require('tap').test;
var translate = require('../lib/translate');

test('setTranslationUnit', function(t) {
  var LB = 1;
  var UB = translate.GPB_MAX_NUMBER_OF_KEYS;
  t.match(translate.setTranslationUnit(null), UB, 'null');
  t.match(translate.setTranslationUnit(undefined), UB, 'undefined');
  t.match(translate.setTranslationUnit('string'), UB, 'string');
  t.match(translate.setTranslationUnit(-1), LB, '-1');
  t.match(translate.setTranslationUnit(0), LB, '0');
  t.match(translate.setTranslationUnit(LB - 1), LB, 'lower bound - 1');
  t.match(translate.setTranslationUnit(UB + 1), UB, 'upper bound + 1');
  t.match(translate.setTranslationUnit(1.234), 1, '1.234');
  t.match(translate.setTranslationUnit(1.567), 2, '1.567');
  t.match(translate.setTranslationUnit('1.234'), UB, '1.234 in string');
  t.match(translate.setTranslationUnit('1.567'), UB, '1.567 in string');
  t.end();
});

test('language mapping for GPB', function(t) {
  helper.enumerateLanguageSync(function(lang) {
    t.equal(
      translate.reverseAdjustLangFromGPB(translate.adjustLangForGPB(lang)),
      lang,
      'Adjust and reversing the lang gives the original.'
    );
  });
  t.end();
});

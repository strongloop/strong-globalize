// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var SG = require('../index');
var helper = require('../lib/helper');

var wellKnownLangs = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ja',
  'ko', 'zh-Hans', 'zh-Hant'];
exports.wellKnownLangs = wellKnownLangs;

var msgWanted = {
  'de': [
    'Sekunde - Haupttiefennachricht',
    'Drittel - Haupttiefennachricht',
    'Viertel - zweite Tiefennachricht',
    'Fünftel - Haupttiefennachricht',
  ],
  'en': [
    'second - primary depth message',
    'third - primary depth message',
    'fourth - second depth message',
    'fifth - primary depth message',
  ],
  'es': [
    new RegExp('^Segundo (mensaje principal profundidad' +
      '|- mensaje de profundidad primario)$'),
    new RegExp('^Tercer( mensaje principal profundidad' +
      '|o - mensaje de profundidad primario)$'),
    new RegExp('^(Mensaje de profundidad de cuatro segundos' +
      '|Cuarto segundo mensaje profundidad)$'),
    new RegExp('^Quinto (mensaje principal profundidad' +
      '|- mensaje de profundidad primario)$'),
  ],
  'fr': [
    new RegExp('^(Deuxième message-profondeur primaire' +
      '|Seconde - message principal de la profondeur)$'),
    new RegExp('^(Message tiers-profondeur primaire' +
      '|Troisième - message principal de la profondeur)$'),
    new RegExp('^(Quatrième message-deuxième profondeur' +
      '|Quatrième - second message de la profondeur)$'),
    new RegExp('^(Message de cinquième primaire profondeur' +
      '|Cinquième - message principal de la profondeur)$'),
  ],
  'it': [
    'Secondo - messaggio di profondità principale',
    'Terzo - messaggio di profondità principale',
    'Quarto - secondo messaggio di profondità',
    'Quinto - messaggio di profondità principale',
  ],
  'ja': [
    '秒- 主要な深さメッセージ',
    '3番目- 主要な深さメッセージ',
    '4番目- 第2の深さメッセージ',
    '5番目- 主要な深さメッセージ',
  ],
  'ko': [
    '두 번째-주요한 깊이 메시지',
    '3 번째-주요한 깊이 메시지',
    '4 번째-두 번째 깊이 메시지',
    '5 번째-주요한 깊이 메시지',
  ],
  'pt': [
    new RegExp('^(Segunda mensagem primária de profundidade' +
      '|Segundo - mensagem de profundidade primária)$'),
    new RegExp('^(Terceira mensagem primária de profundidade' +
      '|Terceiro - mensagem de profundidade primária)$'),
    new RegExp('^((Na quar|Quar)ta segundo a profundidade da mensagem' +
      '|Quarto - mensagem de profundidade segunda)$'),
    new RegExp('^(Quinta mensagem primária de profundidade' +
      '|Quinto - mensagem de profundidade primária)$'),
  ],
  'zh-Hans': [
    '秒-最重要深度信息',
    '第三-最重要深度信息',
    '第四-第二深度信息',
    '第五-最重要深度信息',
  ],
  'zh-Hant': [
    '秒-最重要深度訊息',
    '第三-最重要深度訊息',
    '第四-第二深度訊息',
    '第五-最重要深度訊息',
  ],
};

function secondaryMgr(rootDir, lang, t, aml, positive, callback) {
  var msgFound = [];
  rootDir = rootDir || __dirname;
  global.STRONGLOOP_GLB = undefined;
  SG.SetRootDir(rootDir, {autonomousMsgLoading: aml});
  global.STRONGLOOP_GLB.AUTO_MSG_LOADING = aml;
  SG.SetDefaultLanguage(lang);
  var disableConsole = true;
  SG.SetPersistentLogging(function(level, msg) {
    msgFound.push(msg.message);
    if (msgFound.length === (msgWanted[lang].length + 1)) {
      for (var i = 0; i < msgFound.length - 1; i++) {
        t.comment('checking', msgWanted[lang][i]);
        if (positive) {
          t.match(msgFound[i + 1], msgWanted[lang][i],
            lang + ' message ' + i.toString() + ' is correct.');
        } else {
          t.match(msgFound[i + 1], msgWanted[helper.ENGLISH][i],
            lang + ' message ' + i.toString() + ' is correct.');
        }
      }
      if (callback) callback();
    }
  }, disableConsole);
  t.ok(msgFound[0].indexOf('StrongGlobalize persistent logging started') === 0,
    'StrongGlobalize persistent logging started');
  require('secondary')();
}
exports.secondaryMgr = secondaryMgr;

// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var SG = require('../index');
var helper = require('../lib/helper');
var loadMsgHelper = require('./load-msg-helper');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  formatjson001: {
    out: [
      '{"title":"This is an error.","types":["error","log","info","warn"],' +
        '"threeWrites":{"e":"ewrite","o":"owrite","w":"write"}}\n',
      '{"title":"Dies ist ein Fehler.","types":["Fehler","Protokoll",' +
        '"Informationen","Warnen Sie"],"threeWrites":{"e":"ewrite",' +
        '"o":"owrite","w":"Schreiben Sie"}}\n',
      '{"title":"Este es un error.","types":["Error","Registro",' +
        '"Información","Aviso"],"threeWrites":{"e":"Writevx","o":"Owrite",' +
          '"w":"Escritura"}}\n',
      '{"title":"C\'est une erreur.","types":["Erreur","Journal","Info",' +
        '"Avertir"],"threeWrites":{"e":"Ewrite","o":"Owrite",' +
        '"w":"Ecriture"}}\n',
      '{"title":"Questo è un errore.","types":["Errore","Registrazione",' +
        '"Informazioni","Avvertite"],"threeWrites":{"e":"ewrite",' +
        '"o":"owrite","w":"Scrittura"}}\n',
      '{"title":"Este é um erro.","types":["Erro","REGISTRO","Informação",' +
        '"Avisar"],"threeWrites":{"e":"Ewrite","o":"Owrite","w":"Gravação"}}\n',
      // '{"title":"This is an error.","types":["error","log","info","warn"],' +
      //   '"threeWrites":{"e":"ewrite","o":"owrite","w":"write"}}\n',
      '{"title":"これは間違いです。","types":["間違い","丸太","情報",' +
        '"警告をして下さい"],"threeWrites":{"e":"ewrite","o":"owrite",' +
        '"w":"書いて下さい"}}\n',
      '{"title":"이것은 오류이다.","types":["오류","통나무","정보","경고를 해라"],' +
        '"threeWrites":{"e":"ewrite","o":"owrite","w":"기록"}}\n',
      '{"title":"这个是一在中的错误。","types":["在中的错误","原木","信息","警告"],' +
        '"threeWrites":{"e":"ewrite","o":"owrite","w":"写"}}\n',
      '{"title":"這個是一在中的錯誤。","types":["在中的錯誤","原木","資訊","警告"],' +
        '"threeWrites":{"e":"ewrite","o":"owrite","w":"寫"}}\n',
    ],
    err: [
    ],
  },
};

// results should be exactly the same
targets.formatyaml001 = targets.formatjson001;

var allKeys = '[' +
  '"title",' +
  '["types", 0],' +
  '["types", 1],' +
  '["types", 2],' +
  '["types", 3],' +
  '["threeWrites", "e"],' +
  '["threeWrites", "o"],' +
  '["threeWrites", "w"]' +
']';

test('test formatJson and formatYaml', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, callback) {
      var rootDir = helper.getRootDir();
      global.STRONGLOOP_GLB = null;
      SG.SetRootDir(rootDir);
      var g = SG();
      var fileName = null;
      if (name === 'formatjson001') fileName = 'data.json';
      if (name === 'formatyaml001') fileName = 'data.yml';
      switch (name) {
        case 'formatjson001':
        case 'formatyaml001':
          g.formatMessage(fileName, allKeys);
          var langs = loadMsgHelper.wellKnownLangs;
          langs.forEach(function(lang) {
            g.setLanguage(lang);
            var dataJson = g.formatMessage(fileName,
              '[' +
              '"title",' +
              '["types", 0],' +
              '["types", 1],' +
              '["types", 2],' +
              '["types", 3],' +
              '["threeWrites", "e"],' +
              '["threeWrites", "o"],' +
              '["threeWrites", "w"]' +
              ']', lang);
            console.log(JSON.stringify(dataJson));
          });
          break;
        default:
      }
      unhook_intercept();
      callback();
    }, function() {
      t.end();
    });
});

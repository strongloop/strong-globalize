var SG = require('../index');
var f = require('util').format;

var wellKnownLangs = ['de', 'en', 'es', 'fr', 'it', 'ja',
'ko', 'pt', 'zh-Hans', 'zh-Hant'];
exports.wellKnownLangs = wellKnownLangs;

var msgWanted = {
  en: [
    'second - primary depth message',
    'third - primary depth message',
    'fourth - second depth message',
    'fifth - primary depth message',
  ],
  de: [
    'Sekunde - Haupttiefennachricht',
    'Drittel - Haupttiefennachricht',
    'Viertel - zweite Tiefennachricht',
    'Fünftel - Haupttiefennachricht',
  ],
  es: [
    'Segundo mensaje principal profundidad',
    'Tercer mensaje principal profundidad',
    'Cuarto segundo mensaje profundidad',
    'Quinto mensaje principal profundidad',
  ],
  fr: [
    'Deuxième message-profondeur primaire',
    'Message tiers-profondeur primaire',
    'Quatrième message-deuxième profondeur',
    'Message de cinquième primaire profondeur',
  ],
  it: [
    'Secondo - messaggio di profondità principale',
    'Terzo - messaggio di profondità principale',
    'Quarto - secondo messaggio di profondità',
    'Quinto - messaggio di profondità principale',
  ],
  ja: [
    '秒- 主要な深さメッセージ',
    '3番目- 主要な深さメッセージ',
    '4番目- 第2の深さメッセージ',
    '5番目- 主要な深さメッセージ',
  ],
  ko: [
    '두 번째-주요한 깊이 메시지',
    '3 번째-주요한 깊이 메시지',
    '4 번째-두 번째 깊이 메시지',
    '5 번째-주요한 깊이 메시지',
  ],
  pt: [
    'Segunda mensagem primária de profundidade',
    'Terceira mensagem primária de profundidade',
    'Na quarta segundo a profundidade da mensagem',
    'Quinta mensagem primária de profundidade',
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

function secondaryMgr(lang, t) {
  var msg = f('running language loading test: %s in process %d',
    lang, process.pid);
  console.log(msg);
  var msgFound = [];
  SG.SetRootDir(__dirname);
  SG.SetDefaultLanguage(lang);
  var disableConsole = true;
  SG.SetPersistentLogging(function(level, msg) {
    msgFound.push(msg.message);
  }, disableConsole);
  t.ok(msgFound[0].indexOf(
    'StrongGlobalize persistent logging started') === 0,
    'StrongGlobalize persistent logging started');
  msgFound = [];
  require('secondary')();
  t.equal(msgFound.length, msgWanted[lang].length,
    'all user messages for ' + lang + ' logged');
  if (msgFound.length === msgWanted[lang].length) {
    for (var i = 0; i < msgWanted[lang].length; i++) {
      t.equal(msgFound[i], msgWanted[lang][i],
        lang + ' message ' + i.toString() + ' is correct.');
    }
  }
}
exports.secondaryMgr = secondaryMgr;

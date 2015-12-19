#!/usr/bin/env node

'use strict';

var assert = require('assert');
var async = require('async');
var GLB = require('globalize');
var Parser = require('posix-getopt').BasicParser;
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var util = require('util');

var TARGET_LANGS = ['ja', 'zh-Hans', 'zh-Hant', 'ko',
  'de', 'es', 'fr', 'it', 'pt', 'ru'];

function t(path, variables) {
  return GLB.messageFormatter(path)(variables);
}

function twisterGPB(locale) {
  if (locale === 'pt') return 'pt-BR';
  return locale;
}

function twisterCLDR(locale) {
  return locale;
}

function initIntlDirs(intlRoot) {
  mkdirp.sync(intlRoot + 'en');
  TARGET_LANGS.forEach(function(lang) {
    mkdirp.sync(intlRoot + lang);
  });
}

var CURRENCY_SYMBOLS = {
  ja: 'JPY',
  'zh-Hans': 'CNY',
  'zh-Hant': 'TWD',
  ko: 'KRW',
  de: 'EUR',
  es: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  pt: 'BRL',
  ru: 'RUB',
};
var INTL_ROOT = __dirname + '/intl/';

var MSG = {};

var MY_APP_LANGUAGE = process.env.MY_APP_LANGUAGE || 'en';
assert(MY_APP_LANGUAGE === 'en' || TARGET_LANGS.indexOf(MY_APP_LANGUAGE) >= 0,
  'Locale not supported: ' + MY_APP_LANGUAGE);

initIntlDirs(INTL_ROOT);
loadCldr();
loadMsg();
adjustLocale();
GLB.locale(twisterCLDR(MY_APP_LANGUAGE));

function loadCldr() {
  GLB.load(
    require('cldr-data/main/en/ca-gregorian'),
    require('cldr-data/main/en/currencies'),
    require('cldr-data/main/en/dateFields'),
    require('cldr-data/main/en/numbers'),
    require('cldr-data/supplemental/currencyData'),
    require('cldr-data/supplemental/likelySubtags'),
    require('cldr-data/supplemental/plurals'),
    require('cldr-data/supplemental/timeData'),
    require('cldr-data/supplemental/weekData')
  );
  var bundleCa = 'cldr-data/main/%s/ca-gregorian';
  var bundleCurrencies = 'cldr-data/main/%s/currencies';
  var bundleDates = 'cldr-data/main/%s/dateFields';
  var bundleNumbers = 'cldr-data/main/%s/numbers';
  TARGET_LANGS.forEach(function(lang) {
    GLB.load(
      require(util.format(bundleCa, twisterCLDR(lang))),
      require(util.format(bundleCurrencies, twisterCLDR(lang))),
      require(util.format(bundleDates, twisterCLDR(lang))),
      require(util.format(bundleNumbers, twisterCLDR(lang)))
    );
  });
}

function getCurrencySymbol(locale) {
  if (locale === 'en') return 'USD';
  return CURRENCY_SYMBOLS[locale];
}

function adjustLocale() {
  if (MY_APP_LANGUAGE === 'en') return;
  assert(TARGET_LANGS.indexOf(MY_APP_LANGUAGE) >= 0);
  var twistedLang = twisterCLDR(MY_APP_LANGUAGE);
  if (!MSG[twistedLang] || Object.keys(MSG[twistedLang]).length === 0) {
    console.log(
      '\n**************************************************************\n' +
      '*** Messages are not yet localized.  Fall back to English. ***\n' +
      '**************************************************************\n'
      );
    MY_APP_LANGUAGE = 'en';
  }
}

function loadMsg() {
  MSG = require('./MSG.json');
  if (!MSG.en) MSG.en = {};
  if (Object.keys(MSG.en).length === 0) {
    loadEnglish();
    storeMsg();
  }
  GLB.loadMessages(MSG);
  // console.log('MSG loaded: %j', MSG);
}

function storeMsg() {
  fs.writeFileSync('./MSG.json', JSON.stringify(MSG, null, 4));
}

function writeToMsg(lang, key, value) {
  assert(lang === 'en' || TARGET_LANGS.indexOf(lang) >= 0,
    'Unsupported language key: ' + lang);
  assert(typeof value === 'string',
    'Message value type is not <string>: ' + typeof value);
  // console.log('Adding {%s: "%s"}', key, value);
  var twistedLang = twisterCLDR(lang);
  if (!MSG[twistedLang]) MSG[twistedLang] = {};
  MSG[twistedLang][key] = value;
}

function writeAllToMsg(lang, json) {
  Object.keys(json).forEach(function(key) {
    writeToMsg(lang, key, json[key]);
  });
}

function printHelp($0, prn) {
  var USAGE = fs.readFileSync(require.resolve('./mainTemp.txt'), 'utf-8');
  USAGE = util.format(USAGE,
    t('termusage'),
    t('termoptions'),
    t('msgTitle'),
    t('termOptions'),
    t('msgHelp'),
    t('msgVersion'),
    t('msgTranslate'))
    .replace(/%MAIN%/g, $0)
    .trim();
  USAGE = '\n\n' + USAGE + '\n\n';
  prn(USAGE);
}

function fillZero(value) {
  var vStr = value.toString();
  if (value < 10) vStr = '0' + vStr;
  return vStr;
}

function dateString(dateObj) {
  var dtStr = dateObj.getFullYear().toString() +
    fillZero(dateObj.getMonth() + 1) +
    fillZero(dateObj.getDate()) +
    fillZero(dateObj.getHours()) +
    fillZero(dateObj.getMinutes()) +
    fillZero(dateObj.getSeconds()) + '.' +
    fillZero(dateObj.getMilliseconds());
  return dtStr;
}

function nowString() {
  return dateString(new Date());
}

function getCredentials() {
  var BLUEMIX_USER = process.env.BLUEMIX_USER || 'user';
  var BLUEMIX_PASSWORD = process.env.BLUEMIX_PASSWORD || 'password';
  var BLUEMIX_INSTANCE = process.env.BLUEMIX_INSTANCE || 'instanceid';
  var LC = require('./local-credentials.json');
  LC.credentials.userId = LC.credentials.userId || BLUEMIX_USER;
  LC.credentials.password = LC.credentials.password || BLUEMIX_PASSWORD;
  LC.credentials.instanceId = LC.credentials.instanceId || BLUEMIX_INSTANCE;
  return LC;
}

function loadEnglish() {
  var enDirPath = INTL_ROOT + 'en/';
  var enJsons = fs.readdirSync(enDirPath);
  enJsons.forEach(function(jsonFile) {
    if (jsonFile.indexOf('.') === 0) return;
    var sourceFilePath = enDirPath + jsonFile;
    writeAllToMsg('en', JSON.parse(fs.readFileSync(sourceFilePath)));
  });
}

function translateResource(dirPath, callback) {
  var enDirPath = INTL_ROOT + 'en/';
  debug('enDirPath: %s', enDirPath);
  var enJsons = fs.readdirSync(enDirPath);
  var langs = fs.readdirSync(INTL_ROOT);
  langs.splice(langs.indexOf('en'), 1);
  debug('enJsons: %j', enJsons);
  debug('langs: %j', langs);
  loadMsg();
  async.eachSeries(enJsons, function(jsonFile, enJsonsCb) {
    if (jsonFile.indexOf('.') === 0) {
      enJsonsCb(null);
      return;
    }
    var sourceFilePath = enDirPath + jsonFile;
    console.log('---------- Processing json: %s', jsonFile);
    async.eachSeries(langs, function(lang, langsCb) {
      if (TARGET_LANGS.indexOf(lang) < 0) {
        langsCb();
        return;
      }
      var targetFilePath = INTL_ROOT + lang + '/' + jsonFile;
      console.log('----- Processing language: %s', lang);
      translate(jsonFile, sourceFilePath, targetFilePath, lang, langsCb);
    }, function(err, result) {
      if (err) console.error('***** %s failed: %j', jsonFile, err);
      enJsonsCb(null, result); // carry on even if this file failed
    });
  }, function(err, result) {
    callback(err, result);
    storeMsg();
  });
}

function translate(jsonFile, sourceJson, targetJson, targetLang, callback) {
  var source = JSON.parse(fs.readFileSync(sourceJson));
  var credentials = getCredentials();
  var gpClient = require('g11n-pipeline').getClient(credentials);
  var bundleName = targetLang + '_' + jsonFile + '_' + nowString();
  var myBundle = gpClient.bundle(bundleName);
  var asyncTasks = [];
  asyncTasks.push(function(cb) {
    debug('*** 1 *** myBundle.create');
    myBundle.create({
      sourceLanguage: 'en',
      targetLanguages: [twisterGPB(targetLang)]}, function(err) {
      if (err) console.error('***** myBundle.create error: %j', err);
      cb(err);
    });
  });
  asyncTasks.push(function(cb) {
    debug('*** 2 *** myBundle.uploadStrings');
    myBundle.uploadStrings({
      languageId: 'en',
      strings: source}, function(err) {
      if (err) console.error('***** myBundle.uploadStrings error: %j', err);
      cb(err);
    });
  });
  asyncTasks.push(function(cb) {
    debug('*** 3 *** myBundle.getStrings');

    var maxTry = 5;
    var tryCount = 0;
    var opts = {
      languageId: twisterGPB(targetLang),
      resourceKey: bundleName,
    };
    function myGetStrings() {
      myBundle.getStrings(opts, function(err, data) {
        if (err) {
          console.error('***** myBundle.getStrings error: %j', err);
          if (++tryCount >= maxTry) {
            clearTimeout(timeoutObject);
            cb(err, null);
          }
          console.error('----- myBundle.getStrings waiting for %s count: %d',
            targetLang, tryCount);
          return;
        }
        clearTimeout(timeoutObject);
        cb(err, data.resourceStrings);
      });
    }
    var timeoutObject = setTimeout(myGetStrings, 1000);

  });
  async.series(asyncTasks, function(err, result) {
    if (!err) {
      var translatedJson = result[2];
      writeAllToMsg(targetLang, translatedJson);
      fs.writeFileSync(targetJson, JSON.stringify(translatedJson, null, 4));
      storeMsg();
    }
    callback(null, result); // carry on even if this language failed
  });
}

function main(argv, callback) {
  if (!callback) {
    callback = function() {};
  }

  var parser = new Parser([':',
    'v(version)',
    'h(help)',
    't(translate)',
  ].join(''), argv);

  var option;
  var cmd;
  var $0 = process.env.CMD ? process.env.CMD : path.basename(argv[1]);
  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        loadMsg();
        console.log('\n\n' +
          GLB.formatDate(new Date(), {datetime: 'medium'}) + ' ' +
          t('termVersion', {
            phVersion: require('./package.json').version,
          }) + ' ' +
          GLB.formatNumber(123456.78) + ' ' +
          GLB.formatCurrency(123456.78,
            getCurrencySymbol(MY_APP_LANGUAGE)) + ' ' +
          '\n\n');
        return callback();
      case 'h':
        loadMsg();
        printHelp($0, console.log);
        return callback();
      case 't':
        cmd = option.option;
        loadMsg();
        break;
      default:
        console.error(t('msgInvalidUsageLong', {
          phNearOption: option.optopt,
          phProgramName: $0,
          phHelpOption: ' --help',
        }));
        return callback(Error(t('msgInvalidUsage')));
    }
  }

  if (parser.optind() !== argv.length) {
    console.error(t('msgInvalidUsageExtra', {
      phProgramName: $0,
      phHelpOpiton: ' --help',
    }));
    return callback(Error(t('msgInvalidUsage')));
  }

  if (cmd === 't') translateResource(INTL_ROOT, function(err, result) {
    if (err) {
      debug('translateResource err: %j', err);
    } else {
      debug('translateResource result: %j', result);

    }
    callback(err);
  });

}

main(process.argv, function(err) {
  if (!err) {
    process.exit(0);
  }
  process.exit(1);
});

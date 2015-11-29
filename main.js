#!/usr/bin/env node

'use strict';

var assert = require('assert');
var async = require('async');
var Parser = require('posix-getopt').BasicParser;
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var path = require('path');

// TO-DO: zh-TW is not processed in this code
// TO-DO: zh-CN is not supported in GAAS
var TARGET_LANGS = ['ja', 'zh-CN', 'zh-TW', 'ko',
  'de', 'es', 'fr', 'it', 'pt-BR'];
// TARGET_LANGS = ['ja'];
var INTL_ROOT = __dirname + '/intl/';

var MSG = {};

function loadMsg() {
  MSG = require('./MSG.json');
  if (MSG.en && Object.keys(MSG.en).length === 0) {
    loadEnglish();
    storeMsg();
  }
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
  console.log('Adding {%s: "%s"}', key, value);
  MSG[lang][key] = value;
}

function writeAllToMsg(lang, json) {
  Object.keys(json).forEach(function(key) {
    writeToMsg(lang, key, json[key]);
  });
}

function printHelp($0, prn) {
  var MY_APP_LANGUAGE = process.env.MY_APP_LANGUAGE || 'en';
  if (MY_APP_LANGUAGE !== 'en') console.log('Language: %s', MY_APP_LANGUAGE);
  var USAGE = fs.readFileSync(require.resolve('./main.txt'), 'utf-8')
    .replace(/%MAIN%/g, $0)
    .trim();

  prn(USAGE);
}

function zhTwister(locale) {
  if (locale === 'zh-CN') return 'zh-Hans';
  if (locale === 'zh-TW') return 'zh-Hant';
  return locale;
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
      targetLanguages: [zhTwister(targetLang)]}, function(err) {
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
      languageId: zhTwister(targetLang),
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

  var $0 = process.env.CMD ? process.env.CMD : path.basename(argv[1]);
  var parser = new Parser([':',
    'v(version)',
    'h(help)',
    't(translate)',
  ].join(''), argv);

  var option;
  var cmd;
  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        loadMsg();
        console.log(new Date() + ' Version ' +
          require('./package.json').version);
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
        console.error('Invalid usage (near option \'%s\'), try `%s --help`.',
          option.optopt,
          $0);
        return callback(Error('Invalid usage'));
    }
  }

  if (parser.optind() !== argv.length) {
    console.error('Invalid usage (extra arguments), try `%s --help`.', $0);
    return callback(Error('Invalid usage'));
  }

  if (cmd === 't') translateResource(INTL_ROOT, function(err, result) {
    if (err) {
      debug('translateResource err: %j', err);
    } else {
      debug('translateResource result: %j', result);

    }

    console.log('\n\n---------- BEGIN: Version Command');
    console.log(new Date() + ' Version ' +
      require('./package.json').version);
    console.log('---------- END: Version Command');

    // help command
    console.log('\n\n---------- BEGIN Help Command');
    printHelp($0, console.log);
    console.log('---------- END Help Command\n\n');

    callback(err);
  });

}

main(process.argv, function(err) {
  if (!err) {
    process.exit(0);
  }
  process.exit(1);
});


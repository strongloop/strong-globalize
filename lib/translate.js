// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var _ = require('lodash');
var assert = require('assert');
var async = require('async');
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var gpb = require('g11n-pipeline');
var helper = require('./helper');
var lint = require('./lint');
var optional = require('optional');
var os = require('os');
var path = require('path');
var mkdirp = require('mkdirp');
var mktmpdir = require('mktmpdir');
var wc = require('word-count');

exports.loadMsgFromFile = loadMsgFromFile;
exports.translateResource = translateResource;
exports.adjustLangForGPB = adjustLangForGPB;
exports.reverseAdjustLangFromGPB = reverseAdjustLangFromGPB;
exports.removeDoubleCurlyBraces = removeDoubleCurlyBraces;
exports.setTranslationUnit = setTranslationUnit;

var INTL_DIR = helper.myIntlDir();
// GPB service limits
exports.GPB_MAX_NUMBER_OF_KEYS = 500; // per messages.json
var MY_TRANSLATION_UNIT = exports.GPB_MAX_NUMBER_OF_KEYS;

function bound(n, lowerBound, upperBound) {
  n = (typeof n === 'number') ? Math.round(n) : upperBound;
  n = Math.max(n, lowerBound);
  n = Math.min(n, upperBound);
  return n;
}

function setTranslationUnit(unit) {
  MY_TRANSLATION_UNIT = bound(unit, 1, exports.GPB_MAX_NUMBER_OF_KEYS);
  return MY_TRANSLATION_UNIT;
}

function adjustLangForGPB(lang) {
  if (lang === 'pt') return 'pt-BR';
  return lang;
}

function reverseAdjustLangFromGPB(lang) {
  if (lang === 'pt-BR') return 'pt';
  return lang;
}

function loadMsgFromFile(lang, rootDir, enumerateNodeModules) {
  assert(lang);
  assert(global.STRONGLOOP_GLB);
  rootDir = rootDir || helper.getRootDir();
  if (!helper.isLoadMessages(rootDir)) return;
  enumerateNodeModules = enumerateNodeModules || false;
  var tagType = helper.MSG_TAG;
  helper.enumerateMsgSync(rootDir, lang, enumerateNodeModules,
    function(jsonObj, filePath) {
      // writeAllToMsg(lang, jsonObj);
      var fileName = path.basename(filePath);
      var re = /^([0-9a-f]{32})_(.*)\.txt/;
      var results = re.exec(fileName);
      var fileIdHash;
      if (results && results.length === 3) { // deep-extracted txt file ?
        fileIdHash = results[1];
        fileName = results[2] + '.txt';
      } else {
        fileIdHash = helper.msgFileIdHash(fileName, rootDir);
        fileName = fileName;
      }
      if (helper.resTagExists(fileIdHash, fileName, lang, tagType)) {
        debug('*** loadMsgFromFile(res tag exists): skipping:', lang, fileName);
        return;
      }
      debug('*** loadMsgFromFile(new res tag): loading:', lang, fileName);
      removeDoubleCurlyBraces(jsonObj);
      var messages = {};
      messages[lang] = jsonObj;
      global.STRONGLOOP_GLB.loadMessages(messages);
      helper.registerResTag(fileIdHash, fileName, lang, tagType);
      if (global.STRONGLOOP_GLB.formatters.has(lang)) {
        var formatters = global.STRONGLOOP_GLB.formatters.get(lang);
        for (var key in jsonObj) {
          formatters.delete(key);
        }
      }
    });
}

function removeDoubleCurlyBraces(json) {
  var count = 0;
  Object.keys(json).forEach(function(key) {
    count++;
    json[key] = json[key].replace(/}}/g, '').replace(/{{/g, '');
    debug(count, key + ' : ' + json[key]);
  });
}

var msgStore = {};

function storeMsg() {
  fs.writeFileSync(path.join(INTL_DIR, 'MSG.json'),
    JSON.stringify(helper.sortMsges(msgStore), null, 2) + '\n');
}

function writeAllToMsg(lang, json) {

  function writeToMsg(lang, key, value) {
    assert(typeof value === 'string',
      'Message value type is not <string>: ' + typeof value);
    if (!msgStore[lang]) msgStore[lang] = {};
    msgStore[lang][key] = value;
  }

  assert(helper.isSupportedLanguage(lang),
    'Unsupported language key: ' + lang);
  Object.keys(json).sort().forEach(function(key) {
    writeToMsg(lang, key, json[key]);
  });
}

function getCredentials() {
  var LC = optional(path.join(__dirname, 'local-credentials.json'));
  var BLUEMIX_URL = process.env.BLUEMIX_URL || 'url';
  var BLUEMIX_USER = process.env.BLUEMIX_USER || 'user';
  var BLUEMIX_PASSWORD = process.env.BLUEMIX_PASSWORD || 'password';
  var BLUEMIX_INSTANCE = process.env.BLUEMIX_INSTANCE || 'instanceid';
  if (!LC || !LC.credentials) LC = {
    credentials: {},
  };
  LC.credentials.url = LC.credentials.url || BLUEMIX_URL;
  LC.credentials.userId = LC.credentials.userId || BLUEMIX_USER;
  LC.credentials.password = LC.credentials.password || BLUEMIX_PASSWORD;
  LC.credentials.instanceId = LC.credentials.instanceId || BLUEMIX_INSTANCE;
  return LC;
}

/**
 * translateResource
 *
 * @param {Function} function(err)
 */
function translateResource(callback) {
  INTL_DIR = path.join(helper.getRootDir(), 'intl');
  var myTargetLangs = [];
  helper.enumerateLanguageSync(function(lang) {
    if (lang === helper.ENGLISH) return;
    myTargetLangs.push(adjustLangForGPB(lang));
  });
  var credentials = getCredentials();
  var gpClient = gpb.getClient(credentials);
  gpClient.supportedTranslations({}, function(err, supportedLangs) {
    if (err || !(supportedLangs && supportedLangs.en)) {
      var e = helper.MSG_GPB_UNAVAILABLE;
      console.error(e);
      return callback(e);
    }
    var langs = [];
    myTargetLangs.forEach(function(targetLang) {
      if (supportedLangs.en.indexOf(targetLang) >= 0)
        langs.push(targetLang);
    });
    mktmpdir(function(err, tempDir, done) {
      if (err) return done(err);
      translateResourcePriv(gpClient, langs, tempDir, done);
    }, callback);
  });
}

function reduceMsgFiles(intlDir, tempDir) {
  var langDirs = fs.readdirSync(tempDir);
  if (!langDirs) return;
  // console.log('======= langDirs:', langDirs);
  langDirs.forEach(function(lang) {
    if (!helper.isSupportedLanguage(lang)) return;
    var tempLangDir = path.join(tempDir, lang);
    var tempMsgFiles = fs.readdirSync(tempLangDir);
    var jsonData = {};
    tempMsgFiles.forEach(function(tempMsgFile) {
      if (helper.getTrailerAfterDot(tempMsgFile) !== 'json') return;
      var matched = tempMsgFile.match(/^(.+)_[0-9]*\.json$/);
      if (!matched) return;
      var base = matched[1];
      if (!(base in jsonData)) jsonData[base] = {};
      _.merge(jsonData[base], require(path.join(tempLangDir, tempMsgFile)));
    });
    var bases = Object.keys(jsonData);
    bases.forEach(function(base) {
      fs.writeFileSync(path.join(intlDir, lang, base) + '.json',
        JSON.stringify(helper.sortMsges(jsonData[base]), null, 2));
    });
  });
}

function translateResourcePriv(gpClient, langs, tempDir, callback) {
  var packageName = helper.getPackageName();
  if (!packageName)
    return callback('Package.json not found.');
  if (!helper.initIntlDirs())
    return callback('English resource does not exist.');
  lint.lintMessageFiles(true, function(err) {
    if (err) return;
    var enDirPath = helper.intlDir('en');
    var msgFiles = fs.readdirSync(enDirPath);
    var msgCount = 0;
    var wordCount = 0;
    var characterCount = 0;
    async.eachSeries(msgFiles, function(msgFile, next) {
      var trailer = helper.getTrailerAfterDot(msgFile);
      if (trailer !== 'json' && trailer !== 'txt') {
        next();
        return;
      }
      var source = helper.readToJson(enDirPath, msgFile, 'en');
      if (source) {
        var srcKeys = Object.keys(source);
        var unit = MY_TRANSLATION_UNIT;
        var useTempDir = (srcKeys.length > unit);
        var unitIx = 0;
        var outputDir = useTempDir ? tempDir : INTL_DIR;
        async.whilst(
          function() {
            return (unit * unitIx) < srcKeys.length;
          },
          function(cb) {
            var unitStr = unitIx.toString();
            while (unitStr.length < 6) {
              unitStr = '0' + unitStr;
            }
            var msgFileX = useTempDir ?
              msgFile.replace('.json', '_' + unitStr + '.json') : msgFile;
            var sourceX = {};
            var startIx = unit * unitIx;
            var endIx = Math.min(startIx + unit, srcKeys.length);
            for (var ix = startIx; ix < endIx; ix++) {
              var key = srcKeys[ix];
              sourceX[key] = source[key];
            }
            translate(gpClient, sourceX, INTL_DIR, outputDir,
              langs, msgFileX, function(err) {
                if (err) {
                  console.log('*** translation failed: %s', msgFileX);
                  langs.forEach(function(lang) {
                    lang = reverseAdjustLangFromGPB(lang);
                    var msgFilePath = path.join(tempDir, lang, msgFileX);
                    try {
                      fs.unlinkSync(msgFilePath);
                      console.log('*** removed the residual file: %s%s%s',
                        lang, path.sep, msgFileX);
                    } catch (e) {}
                  });
                } else {
                  for (var key in sourceX) {
                    msgCount++;
                    wordCount += wc(sourceX[key]);
                    characterCount += sourceX[key].length;
                  }
                };
                unitIx++;
                cb();
              });
          },
          function() {
            next();
          }
        );
      } else {
        next();
      }
    }, function done(err, result) {
      console.log('--- translated', msgCount, 'messages,',
        wordCount, 'words,', characterCount, 'characters');
      storeMsg();
      if (err) {
        callback(err);
      } else {
        reduceMsgFiles(INTL_DIR, tempDir);
        lint.lintMessageFiles(false, callback);
      }
    });
  });
}

function translate(gpClient, source, intlDir, outputDir, targetLangs,
  msgFile, callback) {
  var sourceCount = Object.keys(source).length;
  var bundleName = helper.getPackageName() + '_' + msgFile;
  var myBundle = gpClient.bundle(bundleName);
  var asyncTasks = [];
  console.log('--- translating %s', bundleName);
  asyncTasks.push(function(cb) {
    debug('*** 1 *** GPB.create');
    myBundle.create({
      sourceLanguage: 'en',
      targetLanguages: targetLangs}, function(err) {
      if (err) {
        if (err.obj && err.obj.message &&
            (err.obj.message.indexOf('DuplicatedResourceException') >= 0)) {
          err = null;
          // If it exists, ignore error and use it.
        } else {
          console.error('*** GPB.create error: %j', err);
        }
      }
      cb(err);
    });
  });
  asyncTasks.push(function(cb) {
    debug('*** 2 *** GPB.uploadStrings');
    writeAllToMsg('en', source);
    myBundle.uploadStrings({
      languageId: 'en',
      strings: source,
    }, function(err) {
      if (err) console.error('*** GPB.uploadStrings error: %j', err);
      cb(err);
    });
  });
  asyncTasks.push(function(cb) {
    debug('*** 3 *** GPB.getStrings');

    function writeToTxt(jsonObj, targetLang) {
      var keys = Object.keys(jsonObj);
      keys.forEach(function(key) {
        if (helper.getTrailerAfterDot(key) === 'txt') {
          var content = JSON.stringify(jsonObj[key]).slice(1, -1);
          delete jsonObj[key];
          content = content.replace(/\\.?/g, function(esc) {
            if (esc === '\\n') return os.EOL;
            if (esc === '\\t') return '\x09';
            if (esc === '\\"') return '"';
            if (esc === '\\\'') return '\'';
            return esc;
          });
          // fs.writeFileSync(path.join(intlDir, targetLang, key), content);
          fs.writeFileSync(path.join(intlDir, targetLang, msgFile), content);
        }
      });
    }

    function storeTranslatedStrings(targetLang, result) {
      var translatedJson = result;
      targetLang = reverseAdjustLangFromGPB(targetLang);
      // writeAllToMsg(targetLang, translatedJson);
      writeToTxt(translatedJson, targetLang);
      if (Object.keys(translatedJson).length > 0) {
        var targetLandPath = path.join(outputDir, targetLang);
        mkdirp.sync(targetLandPath);
        fs.writeFileSync(path.join(targetLandPath, msgFile),
          JSON.stringify(helper.sortMsges(translatedJson), null, 2) + '\n');
      }
      console.log('--- translated to %s', targetLang);
    }

    async.eachSeries(targetLangs, function(lang, langCb) {
      var intervalMsec = 500;
      var maxTry = 10;
      var tryCount = 0;
      var opts = {
        languageId: lang,
        resourceKey: Object.keys(source)[0], // used for getEntryInfo
      };

      function myGetStrings(lang, callback) {
        myBundle.getStrings(opts, function(err, data) {
          if (err) {
            if (err.obj && err.obj.message &&
                (/Language [^ ]+ does not exist./.test(err.obj.message))) {
              console.error('*** GPB.getStrings error: %j', err.obj.message);
              callback(); // carry on to the next language
              return;
            } else {
              if (++tryCount >= maxTry) {
                console.error(
                  '*** translation to %s failed and skipped.', lang);
                callback(); // carry on to the next language
                return;
              }
              process.stdout.write('.');
              setTimeout(myGetStrings.bind(null, lang, langCb), intervalMsec);
              return; // retry
            }
          }
          var resultCount = Object.keys(data.resourceStrings).length;
          if (resultCount === sourceCount) {
            storeTranslatedStrings(lang, data.resourceStrings);
            callback();
            return;
          }
          myBundle.getEntryInfo(opts, function(err, data) {
            if (err && ++tryCount >= maxTry) {
              console.error('*** GPB.getEntryInfo error: %j', err);
              callback(); // carry on to the next language
              return;
            }
            if ((data && data.resourceEntry.translationStatus === 'FAILED')) {
              // ['SOURCE_LANGUAGE', 'TRALSLATED', 'IN_PROGRESS', 'FAILED']
              console.error('*** translation to %s was incomplete.\n' +
                'Try to delete the bundle %s from the GPB dashboard and ' +
                '"slt-translate -t" again.', lang, bundleName);
              callback();
              return;
            }
            process.stdout.write('.');
            setTimeout(myGetStrings.bind(null, lang, langCb), intervalMsec);
          });
        });
      }
      setImmediate(myGetStrings.bind(null, lang, langCb));
    }, function done() {
      cb();
    });
  });
  // asyncTasks.push(function(result, cb) {
  //   debug('*** 4 *** myBundle.uploadStrings');
  //   myBundle.uploadStrings({
  //     languageId: adjustLangForGPB(targetLang),
  //     strings: source,
  //   }, function(err) {
  //     if (err) console.error('***** myBundle.uploadStrings error: %j', err);
  //     cb(err, result);
  //   });
  // });
  async.waterfall(asyncTasks, function(err) {
    callback(err);
  });
}

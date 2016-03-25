'use strict';

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
var wc = require('word-count');

exports.loadMsgFromFile = loadMsgFromFile;
exports.translateResource = translateResource;
exports.adjustLangForGPB = adjustLangForGPB;
exports.reverseAdjustLangFromGPB = reverseAdjustLangFromGPB;
exports.removeDoubleCurlyBraces = removeDoubleCurlyBraces;

var INTL_DIR = helper.myIntlDir();

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
  rootDir = rootDir || helper.getRootDir();
  enumerateNodeModules = enumerateNodeModules || false;
  var tagType = 'message';
  if (helper.resTagExists(rootDir, lang, tagType)) {
    debug('*** loadMsgFromFile res tag exists:', lang, tagType, rootDir);
    return;
  }
  helper.enumerateMsgSync(rootDir, lang, enumerateNodeModules,
    function(jsonObj) {
    // writeAllToMsg(lang, jsonObj);
    removeDoubleCurlyBraces(jsonObj);
    var messages = {};
    messages[lang] = jsonObj;
    debug('loading ...', JSON.stringify(messages, null, 2));
    global.STRONGLOOP_GLB.loadMessages(messages);
    helper.registerResTag(rootDir, lang, tagType);
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
    JSON.stringify(msgStore, null, 4) + '\n');
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
  var myTargetLangs = [];
  helper.enumerateLanguageSync(function(lang) {
    if (lang === helper.ENGLISH) return;
    myTargetLangs.push(adjustLangForGPB(lang));
  });
  var credentials = getCredentials();
  var gpClient = gpb.getClient(credentials);
  gpClient.supportedTranslations({}, function(err, supportedLangs) {
    if (err)
      return callback('*** GPB.supportedTranslations failed.');
    assert(supportedLangs && supportedLangs.en);
    var langs = [];
    myTargetLangs.forEach(function(targetLang) {
      if (supportedLangs.en.indexOf(targetLang) >= 0)
        langs.push(targetLang);
    });
    translateResourcePriv(gpClient, langs, callback);
  });
}

function translateResourcePriv(gpClient, langs, callback) {
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
        translate(gpClient, source, INTL_DIR, langs, msgFile, function(err) {
          if (err) {
            console.log('*** translation failed: %s', msgFile);
            langs.forEach(function(lang) {
              lang = reverseAdjustLangFromGPB(lang);
              var msgFilePath = path.join(INTL_DIR, lang, msgFile);
              try {
                fs.unlinkSync(msgFilePath);
                console.log('*** removed the residual file: %s%s%s',
                  lang, path.sep, msgFile);
              } catch (e) {}
            });
          } else {
            for (var key in source) {
              msgCount++;
              wordCount += wc(source[key]);
              characterCount += source[key].length;
            }
          };
          next();
        });
      } else {
        next();
      }
    }, function done(err, result) {
      console.log('--- translated', msgCount, 'messages,',
        wordCount, 'words,', characterCount, 'characters.');
      storeMsg();
      if (err) {
        callback(err);
      } else {
        lint.lintMessageFiles(false, callback);
      }
    });
  });
}

function translate(gpClient, source, intlDir, targetLangs, msgFile, callback) {
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

    function writeToTxt(jsonObj, intlDir, targetLang) {
      var keys = Object.keys(jsonObj);
      keys.forEach(function(key) {
        if (helper.getTrailerAfterDot(key) === 'txt') {
          var content = JSON.stringify(jsonObj[key]).slice(1, -1);
          delete jsonObj[key];
          content = content.replace(/\\.?/g, function(esc) {
            if (esc === '\\n') return os.EOL;
            if (esc === '\\t') return '\x09';
            return esc;
          });
          fs.writeFileSync(path.join(intlDir, targetLang, key), content);
        }
      });
    }

    function storeTranslatedStrings(targetLang, result) {
      var translatedJson = result;
      targetLang = reverseAdjustLangFromGPB(targetLang);
      writeAllToMsg(targetLang, translatedJson);
      writeToTxt(translatedJson, intlDir, targetLang);
      if (Object.keys(translatedJson).length > 0)
        fs.writeFileSync(path.join(intlDir, targetLang, msgFile),
          JSON.stringify(translatedJson, null, 4) + '\n');
      console.log('--- translated to %s', targetLang);
    }

    async.eachSeries(targetLangs, function(lang, langCb) {
      var intervalMsec = 500;
      var maxTry = 100;
      var tryCount = 0;
      var opts = {
        languageId: lang,
        resourceKey: bundleName,
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
              console.error('*** GPB.getStrings error: %j', err);
              if (++tryCount >= maxTry) {
                callback(); // carry on to the next language
                return;
              }
              console.error('*** GPB.getStrings waiting for %s count: %d',
                lang, tryCount);
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
          process.stdout.write('.');
          setTimeout(myGetStrings.bind(null, lang, langCb), intervalMsec);
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

#!/usr/bin/env node

'use strict';

var Parser = require('posix-getopt').BasicParser;
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var mkdirp = require('mkdirp').sync;
var nconf = require('nconf');
var path = require('path');
var myVersion = require('./package.json').version;

var TARGET_LANGS = ['ja', 'zh-CN', 'zh-TW', 'ko',
  'de', 'es', 'fr', 'it', 'pt-BR'];
var BLUEMIX_USER = process.env.BLUEMIX_USER || 'user';
var BLUEMIX_PASSWORD = process.env.BLUEMIX_PASSWORD || 'password';

var NLS_ROOT = __dirname + '/nls/';

function printHelp($0, prn) {
  var USAGE = fs.readFileSync(require.resolve('./main.txt'), 'utf-8')
    .replace(/%MAIN%/g, $0)
    .trim();

  prn(USAGE);
}

function scanResource(dirPath) {
  debug('BLUEMIX_USER: %s, BLUEMIX_PASSWORD: %s',
    BLUEMIX_USER, BLUEMIX_PASSWORD);
  var sourceDirPath = NLS_ROOT + 'en/';
  debug('sourceDirPath: %s', sourceDirPath);
  var sourceJsons = fs.readdirSync(sourceDirPath);
  var langs = fs.readdirSync(NLS_ROOT);
  langs.splice(langs.indexOf('en'), 1);
  debug('sourceJsons: %j', sourceJsons);
  debug('langs: %j', langs);
  sourceJsons.forEach(function(file) {
    var sourceFilePath = sourceDirPath + file;
    langs.forEach(function(lang) {
      if (TARGET_LANGS.indexOf(lang) < 0) return;
      translate(sourceFilePath, lang);
    });
  });
}

function translate(sourceJson, targetLang) {
  var targetJson = NLS_ROOT + targetLang + '/';
  var reader = fs.createReadStream(sourceJson);
  var writer = fs.createWriteStream(targetJson);

  writer.on('pipe', function() {
    debug('Piping from %s to: %s', sourceJson, targetLang);
  });

  reader.pipe(writer);
}

function main(argv, callback) {
  if (!callback) {
    callback = function() {};
  }

  var $0 = process.env.CMD ? process.env.CMD : path.basename(argv[1]);
  var parser = new Parser([
    ':v(version)',
    'h(help)',
    't(translate)',
  ].join(''), argv);

  var base = '.strong-globalize-example';
  var cmd = null;
  var configFile = null;

  var option;
  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        console.log(require('../package.json').version);
        return callback();
      case 'h':
        printHelp($0, console.log);
        return callback();
      case 't':
        cmd = option.option;
        break;
      default:
        console.error('Invalid usage (near option \'%s\'), try `%s --help`.',
          option.optopt,
          $0);
        return callback(Error('Invalid usage'));
    }
  }

  scanResource(NLS_ROOT);
  process.exit(0);

  base = path.resolve(base);

  nconf.env();
  if (configFile) nconf.file('driver', configFile);

  // Run from base directory, so files and paths are created in it.
  mkdirp(base);
  process.chdir(base);

  if (parser.optind() !== argv.length) {
    console.error('Invalid usage (extra arguments), try `%s --help`.', $0);
    return callback(Error('Invalid usage'));
  }

  if (cmd == null) {
    console.error('Cmd was not specified, try `%s --help`.', $0);
    return callback(Error('Missing cmd'));
  }

  console.log('strong-globalize-example: %s %s %s', cmd, base, myVersion);

}

main(process.argv, function(er) {
  if (!er) {
    process.exit(0);
  }
  process.exit(1);
});

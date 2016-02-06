'use strict';

var assert = require('assert');
var debug = require('debug')('strong-globalize');
var esprima = require('esprima');
var est = require('estraverse');
var fs = require('fs');
var helper = require('./helper');
var htmlparser = require('htmlparser2');
var md5 = require('md5');
var mkdirp = require('mkdirp');
var path = require('path');
var wc = require('word-count');

exports.extractMessages = extractMessages;
exports.scanAst = scanAst;
exports.scanHtml = scanHtml;
exports.setHtmlRegex = setHtmlRegex;

var options = { // esprima parse options
  loc: false, // Nodes have line and column-based location info
  range: false, // Nodes have an index-based location range (array)
  raw: false, // We don't need raw.  Value is enough.
  tokens: false, // An extra array containing all found tokens
  comment: false, // An extra array containing all line and block comments
  tolerant: false, // An extra array containing all errors found,
  // attempts to continue parsing when an error is encountered
};

var GLB_FN = [
  'formatMessage', 't', 'm', 'format', 'f', 'Error',
  // RFC 5424 syslog levels and misc logging levels
  'ewrite', 'owrite', 'write',
  // RFC 5424 Syslog Message Severities
  'emergency', 'alert', 'critical', 'error', 'warning',
  'notice', 'informational', 'debug',
  // Node.js console
  'warn', 'info', 'log',
  // Misc Logging Levels
  'help', 'data', 'prompt', 'verbose', 'input', 'silly',
];
var g = require('./globalize');
GLB_FN.forEach(function(fn) {
  assert(g[fn], '"' + fn + '" is exported by strong-globalize.');
});

var HTML_REGEX = null;
var HTML_REGEX_HEAD = null;
var HTML_REGEX_TAIL = null;

/**
 * Customize regex to extract string out of HTML text
 *
 * @param {RegExp} regex to extract the whole string out of the HTML text
 * @param {RegExp} regexHead to trim the head portion from
 *    the extracted string
 * @param {RegExp} regexTail to trim the tail portion from
 *    the extracted string
 */
function setHtmlRegex(regex, regexHead, regexTail) {
  assert(regex);
  try {
    regex.test('');
    HTML_REGEX = regex;
  } catch (e) {
    throw new Error('*** setHtmlRegex: \'regex\' is illegal.');
  }
  if (regexHead)
    try {
      regex.test('');
      HTML_REGEX_HEAD = regexHead;
    } catch (e) {
      throw new Error('*** setHtmlRegex: \'regexHead\' is illegal.');
    }
  if (regexTail)
    try {
      regexTail.test('');
      HTML_REGEX_TAIL = regexTail;
    } catch (e) {
      throw new Error('*** setHtmlRegex: \'regexTail\' is illegal.');
    }
}

setHtmlRegex(
  /^([^{]|{(?!{))*{{(.|\s)+\s*\|\s*globalize\s*}}(.|\s)*$/,
  /^([^{]|{(?!{))*{{/,
  /\s*\|\s*globalize\s*}}(.|\s)*$/
);

/**
 * Extract resource strings and returns an array of strings.
 *
 * @param {string} content The source code as a string
 */
function extractMessages(blackList, callback) {
  mkdirp.sync(helper.intlDir(helper.ENGLISH));
  var msgs = {};
  var msgCount = 0;
  var wordCount = 0;
  var characterCount = 0;

  function addToMsgs(msgArray) {
    if (msgArray) msgArray.forEach(function(msg) {
      if (helper.getTrailerAfterDot(msg) === 'txt') return;
      var key = md5(msg);
      if (key in msgs) {
        debug('*** Key %s exists and overwriting.', key, ':', msg);
        return;
      }
      console.log('    extracted: %s', msg);
      if (helper.percent(msg)) msg = helper.mapPercent(msg);
      msgs[key] = msg;
      msgCount++;
      wordCount += wc(msg);
      characterCount += msg.length;
    });
  }

  helper.enumerateFilesSync(null, blackList,
    ['html', 'htm'], function(content) {
      addToMsgs(scanHtml(content));
    });
  helper.enumerateFilesSync(null, blackList,
    'js', function(content) {
      addToMsgs(scanAst(content));
    });
  var langDirPath = helper.intlDir(helper.ENGLISH);
  var msgFiles = null;
  var messagesJsonExists = false;
  try {
    msgFiles = fs.readdirSync(langDirPath);
  } catch (e) {
  }
  if (msgFiles) msgFiles.forEach(function(msgFile) {
    if (msgFile.indexOf('.') === 0) return;
    var fileType = helper.getTrailerAfterDot(msgFile);
    if (fileType !== 'json') return;
    var isMessagesJson = (msgFile === 'messages.json');
    messagesJsonExists = messagesJsonExists || isMessagesJson;
    var msgFilePath = path.join(langDirPath, msgFile);
    var jsonObj = JSON.parse(fs.readFileSync(msgFilePath));
    var keys = Object.keys(jsonObj);
    keys.forEach(function(key) {
      if (helper.hashKeys(key)) delete jsonObj[key];
    });
    if (isMessagesJson) {
      for (var key in msgs) jsonObj[key] = msgs[key];
    }
    fs.writeFileSync(msgFilePath, JSON.stringify(jsonObj, null, 4) + '\n');
  });
  if (!messagesJsonExists) {
    var msgFilePath = path.join(langDirPath, 'messages.json');
    fs.writeFileSync(msgFilePath, JSON.stringify(msgs, null, 4) + '\n');
  }
  console.log('--- extracted', msgCount, 'messages,',
    wordCount, 'words,', characterCount, 'characters.');
  callback();
}

function scanHtml(content) {
  var msgs = [];
  var tn = [];
  var tc = [];
  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs) {
      tn.push(name);
      tc.push(attribs.class); // could be null
    },
    ontext: function(text) {
      text = text.trim().replace(/\s+/g, ' ');
      debug(text);
      if (tc.length > 0 && tc[tc.length - 1] === 'strong-globalize') {
        if (text) msgs.push(text);
        return;
      } else {
        var result = HTML_REGEX.exec(text);
        if (!result || result.length === 0) {
          if (text) console.log('    --skipped: %s', text);
          return;
        }
        if (HTML_REGEX_HEAD) result[0] = result[0].replace(HTML_REGEX_HEAD, '');
        if (HTML_REGEX_TAIL) result[0] = result[0].replace(HTML_REGEX_TAIL, '');
        text = result[0].trim().replace(/\s+/g, ' ');
      }
      if (text) msgs.push(text);
    },
    onclosetag: function(tagname) {
      var closingTabName = tn.pop();
      var closingClass = tc.pop();
      if (closingTabName !== tagname) {
        console.log('*** scanHtml: closing tag missing: %s of class: %s',
          closingTabName, closingClass);
      }
    },
    onerror: function(err) {
      if (err) {
        console.log(JSON.stringify(err, null, 2) +
          '\n*******************************************************' +
          '\n*** Please fix the HTML or blacklist the directory. ***' +
          '\n*******************************************************\n');
        process.exit(1);
        return null;
      }
    },
  }, {decodeEntities: true, recognizeCDATA: true, recognizeSelfClosing: true});
  parser.write(content);
  parser.end();
  return msgs;
}

function scanAst(content) {
  var shebangExpr = /^\s*#\!.*?(\r\n|\r|\n)/m;
  if (shebangExpr.test(content)) { // hide it.
    content = content.replace(/#\!/, '//');
  }
  try {
    var ast = esprima.parse(content, options);
  } catch (e) {
    console.log(JSON.stringify(e, null, 2) +
      '\n**********************************************************' +
      '\n*** Please fix the JS code or blacklist the directory. ***' +
      '\n**********************************************************\n');
    process.exit(1);
    return null;
  }

  var glb = null;
  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (node.type === 'VariableDeclarator'
        && node.init
        && node.init.arguments
        && node.init.arguments.length > 0) {
        node.init.arguments.forEach(function(arg, ix) {
          if (arg.type === 'Literal'
            && arg.value === 'strong-globalize') {
            if (glb) debug(
              '*** New %s overwriting the old: %s', node.id.name, glb);
            glb = node.id.name;
          }
        });
      }
    },
  });
  if (!glb) return null;
  var msgs = [];
  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (node.type === 'CallExpression'
        && node.callee.type === 'MemberExpression'
        && node.callee.object
        && node.callee.object.type === 'Identifier') {
        if (node.callee.object.name === glb) {
          if (GLB_FN.indexOf(node.callee.property.name) >= 0) {
            var msg = binExpOrLit(node.arguments[0]);
            if (!msg) {
              console.log('*** non-literal argument and skipped:',
                glb + '.' + node.callee.property.name);
              return;
            }
            msgs.push(msg);
          }
        }
      }
    },
  });
  return msgs;
}

function binExpOrLit(nd) {
  if (nd.type === 'Literal') return nd.value;
  if (nd.type === 'BinaryExpression') {
    assert(nd.operator === '+');
    var left = binExpOrLit(nd.left);
    var right = binExpOrLit(nd.right);
    if (left && right) return (left + right);
    return null;
  }
  return null;
}

# strong-globalize

StrongLoop Globalize API and CLI

# Architecture

strong-globalize is built on top of two foundation layers: Unicode CLDR and jquery/globalize.  The Unicode CLDR provides key building blocks for software to support the world's languages, with the largest and most extensive standard repository of locale data available.  jquery/globalize is a JavaScript library for internationalization and localization that leverages the Unicode CLDR JSON data. The library works both for the browser and as a Node.js module. 

strong-globalize is a JavaScript library for internationalization and localization (globalization in one word) of a Node.js package built on top of jquery/globalize.  strong-globalize provides these features:
- shorthands and wrappers for the format functions supported by Node.js console, jquery/globalize, and util.format,
- automatic extraction of the strings from JS code and HTML templates and auto-creation of resource JSON,
- machine translation of the resource JSON using IBM Globalization Pipeline on Bluemix,
- in Node.js runtime, loads not only the CLDR data sets but the localized string resources of your module as well as all the dependent modules.
- function hook to grab localized user messages so that the client can log what is shown to the end user along with the original English message in its log file.

As shown in the Demo section of this README(bottom of the page), the globalized code using strong-globalzie is simpler and easier to read than the original code written without strong-globalize; and more importantly, you get all the features at no extra effort.




## `npm install -g strong-globalize`
## `var g = require('strong-globalize');`

# API - Set system defaults

## `g.setDefaultLanguage(lang)`
- `lang` : {`string`} (optional, default: `'en'`) Language ID.  It tries to use OS language, then falls back to 'en'  Supported langauges are: de, en, es, fr, it, ja, ko, pt, ru, zh-Hans, and zh-Hant.

## `g.setRootDir(rootPath)`
- `rootPath` : {`string`} App's root directory full path

## `g.setHtmlRegex(regex, regexHead, regexTail)`
- `regex` : {`RegExp`} to extract the whole string out of the HTML text
- `regexHead` : {`RegExp`} to trim the head portion from the extracted string
- `regexTail` : {`RegExp`} to trim the tail portion from the extracted string

Most clients do not need to setHtmlRegex.  See "Globalize HTML Templates" for details.


# API - Formatters

## `g.formatMessage(path, variables)`
- `path {string}` The message key
- `variables {object}` (optional, default: null) List of placeholder key and content value pair

## `g.t(path, variables)`
alias of `formatMessage`

## `g.m(path, variables)`
alias of `formatMessage`

## `g.formatCurrency(value, currencySymbol, options)`
- `value {number}` integer or float
- `currencySymbol {string}` ISO 4217 three-letter currency code such as `'USD'` for US Dollars 
- `options {object}` (optional) Strongly recommended to set NO options and let strong-globalize use the StrongLoop default for consistency across StrongLoop products.

## `g.c(value, currencySymbol, lang, options)`
alias of `formatCurrency`

## `g.formatDate(value, options)`
- `value {Date object}` Date
- `options {object}` (optional) Strongly recommended to set NO options and let strong-globalize use the StrongLoop default for consistency across StrongLoop products.

## `g.d(value, options)`
alias of `formatDate`

## `g.formatNumber(value, options)`
- `value {number}` integer or float
- `options {object}` (optional) Strongly recommended to set NO options and let strong-globalize use the StrongLoop default for consistency across StrongLoop products.

## `g.n(value, options)`
alias of `formatNumber`

# API - Message Formatter Wrappers

%s place folders are supported.  Intended to directly globalize strings embedded in the first parameter of Error, console.error, console.log, etc. and util.format by simply replacing console or util with require('strong-globalize').

## `g.Error(path, ...)`
returns Error with a formatted message.

## `g.format(path, ...)`
returns the result message from `formatMessage`.  intended to replace util.format.

## `g.f(path, ...)`
alias of `format`

## `g.ewrite(path, ...)`
passes the result message from `formatMessage` to `process.stderr.write`, and log to file with `error` level if persistent logging is set.

## `g.owrite(path, ...)`
passes the result message from `formatMessage` to `process.stdout.write`, and log to file with `info` level if persistent logging is set.

## `g.write(path, ...)`
alias of `owrite`

### RFC 5424 Syslog Message Severities

## `g.emergency(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `emergency` level if persistent logging is set.

## `g.alert(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `alert` level if persistent logging is set.

## `g.critical(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `critical` level if persistent logging is set.

## `g.error(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `error` level if persistent logging is set.

## `g.warning(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `warning` level if persistent logging is set.

## `g.notice(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `notice` level if persistent logging is set.

## `g.informational(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `informational` level if persistent logging is set.

## `g.debug(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `debug` level if persistent logging is set.

### Node.js console

## `g.warn(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `warn` level if persistent logging is set.

## `g.info(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `info` level if persistent logging is set.

## `g.log(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `log` level if persistent logging is set.

### Misc Logging Levels

## `g.help(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `help` level if persistent logging is set.

## `g.data(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `data` level if persistent logging is set.

## `g.prompt(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `prompt` level if persistent logging is set.

## `g.verbose(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `verbose` level if persistent logging is set.

## `g.input(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `input` level if persistent logging is set.

## `g.silly(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `silly` level if persistent logging is set.

# Usage Examples:

`var g = require('strong-globalize');`

## help *.txt files

before:
```js
	var help = fs.readFileSync(require.resolve('./sl-deploy.txt'), 'utf-8');
````
after:
```js
	var help = g.t('sl-deploy.txt');
```
and store sl-deploy.txt file under intl/en.

## double curly braces for "don't translate"
Use double curly braces {{ }} as "don't translate" indicator.

before:
```js
	console.error('Invalid usage (near option \'%s\'), try `%s --help`.', option, cmd);
```
after:
```js
	g.error('Invalid usage (near option \'%s\'), try {{`%s --help`}}.', option, cmd);
```

## use g.format for util.format

before:
```js
	Error(util.format('Directory %s does not exist', workingDir));
```
after:
```js
	Error(g.format('Directory %s does not exist', workingDir));
```
or
```js
	g.Error('Directory %s does not exist', workingDir);
```
## use g.write for process.std.write

before:
```js
	// don't concatenate string. word order varies from language to language.
	process.stdout.write('Directory ' + workingDir + ' does not exist...');
```
wrong:
```js
	process.stdout.write(g.t('Directory ') + workingDir + g.t(' does not exist...'));
```
correct:
```js
	g.write('Directory %s does not exist...', workingDir);
```
## place holders
You can use place holders and parameters in one of these four ways if you'd like:

before:
```js
	util.format('Deploy %s to %s failed: %s', what, url, err);
```
after
```js
	// 1 (recommended; simply replace `util` with `g`)
	g.format('Deploy %s to %s failed: %s', what, url, err);
	// 2
	g.format('Deploy {0} to {1} failed: {2}', [what, url, err]);
	// 3
	g.format('Deploy {0} to {1} failed: {2}', {0: what, 1: url, 2: err});
	// 4
	g.format('Deploy {what} to {url} failed: {err}', {what: what, url: url, err: err});
```
## other cases
In case you need to manually add message strings to the resource file, use a key: msg* such as msgPortNumber.  Those keys are kept intact in auto-extraction and the value text will be properly translated.

For example, frontend modules such as StrongLoop Arc contain many UI strings in HTML.  You can use a filter or a tool for the template engine to extract strings to strong-globalize resource JSON, and use slt-globalize CLI.

Note that strong-globalize supports multiple *.txt and multiple *.json files under intl/en.

## help txt files and msg keys

They must be uniquely named because they are used as-is in runtime message database where the messages come from other modules will be merged.  In case there are duplicate *.txt or msg*, it could be overwritten by other module(s) with the same name whichever is loaded later.  Best practice is to use your package name as part of the name.  For example, `msgMyPackage_ErrorMessage`.

When you put placeholders in help txt and msg messages, named or ordered placeholders should be used.  Named placeholder is something like `{userName}`.  Ordered placeholder is `{0}`, `{1}`, `{2}`, etc. which should be zero-base.

The rule of thumb is `strong-globalize` extracts messages from JS and HTML template files and creates the `messages.json` file (or appends extracted messages to the `messages.json` if it exists), but does not edit the help txt files, msg messages, or JS/HTML files provided by the client.

# CLI

### usage: `slt-globalize [options]`

Options:
-  `-e,--extract [black list]`      Extract resource strings to en/messages.json except for directories on [black list] separated by a space.
-  `-h,--help`         Print this message and exit.
-  `-l,--lint`         Check validity of string resource.
-  `-t,--translate`    Translate string resource.
-  `-v,--version`      Print version and exit.

## lib/local-credentials.json

To access Globalization Pipeline on Bluemix service for machine translation, credentials should be provided in one of the two ways:

(1) By lib/local-credentials.json

Copy from the service dashboard and paste something like the following into lib/local-credentials.json.

`{
  "credentials": {
    "url": "https://gp-beta-rest.ng.bluemix.net/translate/rest",
    "userId": "6e41ceac9f14b493faxxxxxxxxxxxxxx",
    "password": "vLbqlkjPhJiwJlkjwou8woO82hk2huku",
    "instanceId": "6888888888888e6d2f458b1b4b5fd010"
  }
}`

(2) By environment variables

For example,

`BLUEMIX_URL="https://gp-beta-rest.ng.bluemix.net/translate/rest" BLUEMIX_USER=6e41ceac9f14b493faxxxxxxxxxxxxxx BLUEMIX_PASSWORD=vLbqlkjPhJiwJlkjwou8woO82hk2huku BLUEMIX_INSTANCE=6888888888888e6d2f458b1b4b5fd010 slt-globalize -t`

# Demo

To quickly switch the locale, change the OS's system locale or set STRONGLOOP_GLOBALIZE_APP_LANGUAGE environment variable to one of the supported languages such as `ja` for Japanese, `zh-Hans` for Simplified Chinese, or `de` for German.

For example, on OSX:

```js
	cd gmain
	LANG=ja node index.js
```

## `gsub/index.js`

before:

```js
	var fs = require('fs');
	var util = require('util');

	exports.getHelpText = getHelpText;
	exports.getUserName = getUserName;

	function getUserName() {
	  var userName = util.format('user: %s', process.env.USER);
	  return userName;
	}

	function getHelpText() {
	  var helpText = fs.readFileSync(require.resolve('./gsub.txt'), 'utf-8');
	  return helpText;
	}
```
after:
- `var g = require('strong-globalize');`
- replace `util` with `g`
- replace `readFile *.txt` with simply `g.t` and move `./gsub.txt` to `./intl/en/gsub.txt`
- then, run `slt-globalize -e` to extract and `slt-globalize -t` to machine translate the string resource.

```js
	var g = require('strong-globalize');

	exports.getHelpText = getHelpText;
	exports.getUserName = getUserName;

	function getUserName() {
	  var userName = g.format('user: %s', process.env.USER);
	  return userName;
	}

	function getHelpText() {
	  return g.t('gsub.txt');
	}

```

## `gmain/index.js`

before:

```js
	var express = require('express');
	var request = require('request');
	var app = express();
	var util = require('util');
	var gsub = require('gsub');

	app.get('/', function(req, res) {
	  var helloMessage = util.format('%s Hello World', new Date());
	  res.end(helloMessage);
	});

	var port = process.env.PORT || 8123;
	app.listen(port, function() {
	  console.log('Listening on %s by %s.', port, gsub.getUserName());
	});

	setInterval(function(){
		process.stdout.write('Sending request to ' + port + '...');
		request('http://localhost:' + port,
			function(error, response, body) {console.log(body);});
	},1000);

	console.log(gsub.getHelpText());

```
after:
- `var g = require('strong-globalize');`
- replace `util` with `g`
- replace `console` with `g`
- replace `process.stdout` with `g`
- wrap `new Date()` with `g.d()`
- then, run `slt-globalize -e` to extract and `slt-globalize -t` to machine translate the string resource.

```js
	var express = require('express');
	var request = require('request');
	var app = express();
	var g = require('strong-globalize');
	var gsub = require('gsub');

	app.get('/', function(req, res) {
	  var helloMessage = g.format('%s Hello World', g.d(new Date()));
	  res.end(helloMessage);
	});

	var port = process.env.PORT || 8123;
	app.listen(port, function() {
	  g.log('Listening on %s by %s.', port, gsub.getUserName());
	});

	setInterval(function(){
		g.owrite('Sending request to %s ...', port);
		request('http://localhost:' + port,
			function(error, response, body) {console.log(body);});
	},1000);

	console.log(gsub.getHelpText());

```

# Globalize HTML Templates

Many UI strings are included in HTML templates.  `slt-globalize -e` supports string extraction from the HTML templates as well as JS files.  Once extracted, `slt-globalize -t` can be used to translate the resource JSON.

In the following example, the two strings `{{StrongLoop}} History Board` and `History board shows the access history to the e-commerce web site.` are extracted to JSON.

```
	<div class="board-header section-header">
		<h2>{{{{StrongLoop}} History Board | globalize}}</h2>
	</div>
	<div role="help-note">
		<p>
			{{ History board shows the access history to the e-commerce web site. | globalize }}
		</p>
	</div>
```

`strong-globalize` supports `{{ <string to be localized> | globalize }}` out of  box.  In case you need other pattern matching rule for your template engine, you can set custom RegExp by `setHtmlRegex` API.

The string extraction works for CDATA as well.  `Text in cdata` is extracted in the following example:

```
	<![CDATA[
		{{Text in cdata | globalize }}
	]]>
```

# Persistent Logging

strong-globalize provides 'persistent logging' by passing all the localized messages to client-supplied logging function.  For example, if the client uses `winston` file transport for logging, the client code would look like this:

Client:
```js
	var g = require('strong-globalize'); // strong-globalize handle
	var w = require('winston'); // winston handle

	g.setRootDir(__dirname);
	g.setDefaultLanguage();
	initWinston(w);
	var disableConsole = false;
	g.setPersistentLogging(w.log, disableConsole);

	function initWinston(w) {
	  var options = {
	    filename: __dirname + '/system.log',
	    maxsize: 1000000,
	    maxFiles: 10,
	    zippedArchive: true,
	  };
	  w.add(w.transports.File, options);
	  w.remove(w.transports.Console);
	}

```

To enable the persistent logging, call `setPersistentLogging(logFn, bool)` where, `logFn` is a callback function accepting two arguments in this order: `level` (UTF8 string) -- urgency level and `messsage` (object) with three properties, and `bool` is to specify if `console` logging should be disabled or not (default: false = enabled). 

```js
	{
		message: 'ホスト:localhostのポート:8123へ送っています。',
		orig: 'Sending to host: %s, port: %d ...',
		vars: ['localhost', 8123],
	}
```

In addition, the following API's show a localized message to console.log as well as writes it to the file with `verbose` and `debug` level respectively.  All the other console logging API (error, warn, info, log, write, owrite, and ewrite) are also logFn-aware.  

## `g.verbose(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `verbose` level if persistent logging is set.

## `g.debug(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `debug` level if persistent logging is set.

## Persistent Logging Demo `gmain/index.js`

```js
	var express = require('express');
	var request = require('request');
	var app = express();
	var g = require('strong-globalize'); // strong-globalize handle
	var gsub = require('gsub');
	var w = require('winston'); // winston handle

	g.setRootDir(__dirname);
	g.setDefaultLanguage();
	initWinston(w); // see the Client initialization
	g.setPersistentLogging(w.log);

	app.get('/', function(req, res) {
	  var helloMessage = g.format('%s Hello World', g.d(new Date()));
	  w.info(helloMessage); // write only to the log file with 'info' level
	  res.end(helloMessage);
	});

	var port = process.env.PORT || 8123;
	app.listen(port, function() {
	  g.log('Listening on %s by %s.', port, gsub.getUserName());
	});

	setInterval(function(){
		g.owrite('Sending request to %s ...', port);
		request('http://localhost:' + port,
			function(error, response, body) {console.log(body);});
	},1000);

	g.info(gsub.getHelpText()); // write to both console and the log file with 'info' level

```

Note:
`w.info(helloMessage)` directly calls the winston API `info` and write `helpMessage` to the log file.
`g.info(gsub.getHelpText())` writes the localized help text to both console and the log file with `info` level.  The other strong-globalize API calls, i.e., `g.log` and `g.owrite` also write the localized message to both console and the log file with `info` level.

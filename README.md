# strong-globalize

StrongLoop Globalize API and CLI

# Architecture

strong-globalize is built on top of two foundation layers: Unicode CLDR and jquery/globalize.  The Unicode CLDR provides key building blocks for software to support the world's languages, with the largest and most extensive standard repository of locale data available.  jquery/globalize is a JavaScript library for internationalization and localization that leverages the Unicode CLDR JSON data. The library works both for the browser and as a Node.js module. 

strong-globalize is a JavaScript library for internationalization and localization (globalization in one word) of a Node.js package built on top of jquery/globalize.  strong-globalize provides these features:
- shorthands and wrappers for the format functions supported by Node.js console, jquery/globalize, and util.format,
- automatic extraction of the strings from JS code and HTML templates and auto-creation of resource JSON,
- machine translation of the resource JSON using IBM Globalization Pipeline on Bluemix,
- in Node.js runtime, loads not only the CLDR data sets but the localized string resources of your module as well as all the dependent modules.

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

## `g.formatCurrency(value, currencySymbol, options)`
- `value {number}` integer or float
- `currencySymbol {string}` ISO 4217 three-letter currency code such as `'USD'` for US Dollars 
- `options {object}` (optional) Strongly recommended to set NO options and let strong-globalize use the StrongLoop default for consistency across StrongLoop products.

## `g.c(value, currencySymbol, lang, options)`
alias of `formatCurrency`

# API - Message Formatter Wrappers

%s place folders are supported.  Intended to direcly globalize strings embedded in the first parameter of Error, console.error, console.log and util.format by simply replacing console or util with require('strong-globalize').

## `g.Error(path, ...)`
returns Error with a formatted message.

## `g.log(path, ...)`
passes the result message from `formatMessage` to `console.log`.

## `g.error(path, ...)`
passes the result message from `formatMessage` to `console.error`.

## `g.info(path, ...)`
passes the result message from `formatMessage` to `console.info`.

## `g.warn(path, ...)`
passes the result message from `formatMessage` to `console.warn`.

## `g.ewrite(path, ...)`
passes the result message from `formatMessage` to `process.stderr.write`.

## `g.owrite(path, ...)`
passes the result message from `formatMessage` to `process.stdout.write`.

## `g.write(path, ...)`
alias of `owrite`

## `g.format(path, ...)`
returns the result message from `formatMessage`.  intended to replace util.format.

## `g.f(path, ...)`
alias of `format`

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
	// don't concatenate string. word order varies from lanauage to language.
	process.stdout.write('Directory ' + workingDir + ' does not exist...');
```
after:
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
	// 1
	g.format('Deploy %s to %s failed: %s', what, url, err);
	// 2
	g.format('Deploy {0} to {1} failed: {2}', [what, url, err]);
	// 3
	g.format('Deploy {0} to {1} failed: {2}', {0: what, 1: url, 2: err});
	// 4
	g.format('Deploy {what} to {url} failed: {err}', {what: what, url: url, err: err});
```
## other cases
In case you need to manually add message strings to the resource file, use a key: msg* such as msgPortNumber.  Those keys are kept intact in auto-extraction and will be translated.

For example, frontend modules such as StrongLoop Arc contain many UI strings in HTML.  You can use a filter or a tool for the frontend rendering engine to extract strings to strong-globalize resource JSON, and use slt-globalize CLI.

Note that strong-globalize supports multiple *.txt and multiple *.json files under intl/en.

## help txt files and msg keys

They must be uniquely named because they are used as-is in runtime message database where the messages come from other modules will be merged.  In case there are duplicate *.txt or msg*, it could be overwritten by other module(s) with the same name whichever is loaded later.  Best practice is to use your package name as part of the name.  For example, `msgMyPackage_ErrorMessage`.

When you put placeholders in help txt and msg messages, named or ordered placeholders should be used.  Named placeholder is something like `{userName}`.  Ordered placeholder is `{0}`, `{1}`, `{2}`, etc. which should be zero-base.

Rule of thumb is `strong-globalize` extracts messages from js files and creates the `messages.json` file (or appends extracted messages to the `messages.json` if it exists), but does not edit the help txt files, msg messages, or js files provided by the client.

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
- then, run `slt-globalize -e` to exract and `slt-globalize -t` to machine translate the string resource.

```js
	var fs = require('fs');
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
- then, run `slt-globalize -e` to exract and `slt-globalize -t` to machine translate the string resource.

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

Many UI strings are included in HTML temaplates.  `slt-globalize -e` supports string extraction from the HTML templates as well as JS files.  Once extracted, `slt-globalize -t` can be used to translate the resource JSON.

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

`strong-globalize` supports `{{ <string to be localized> | globalize }}` out of  box.  In case you need other pattern matching rule for you template engine, you can set custom RegExp by `setHtmlRegex` API.

The string extraction works for CDATA as well.  `Text in cdata` is extracted in the following example:

```
	<![CDATA[
		{{Text in cdata | globalize }}
	]]>
```


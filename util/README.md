# app.js

Assembles CLDR data of the specified languages to one .json file.

Usage

Out of box, one `json` file is included which contains CLDR data for the languages enabled in app.js.  In the installation of `strong-globalize` in your package, you can replace the out-of-box CLDR file entirely, or add extra CLDR files to the `cldr` directory.

First, look for cldr_*.json file(s) stored under `cldr` directory of `strong-globalize` The file name shows the CLDR version number `strong-globalize` uses.  Make sure you install `cldr-data` with the same version by `npm install`; for example, `npm install cldr-data@29.0.1`

After installing the compatible `cldr-data` package, edit LANGS array in `app.js` and run it by `node app.js`  The languages implemented by the `cldr-data` package are listed under cldr-data/main directory.  `cldr_*.json` will be generated such as `cldr_29.0.1.json`  Store the CLDR file under `cldr` directory of `strong-globalize` in your package.

In runtime, `strong-globalize` dynamically loads in memory just the CLDR data required for the language specified by setDefaultLanguage().  First, it examines all the CLDR files under cldr directory in alphabetical order.  If the language is defined in two or more CLDR files, duplicate objects will be overwritten in the examination order.


```js
	$node app.js
	
```
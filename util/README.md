# app.js

Assembles and compresses CLDR data of the specified languages to one .gz file.

Usage

Out of box, one `gz` file is included which contains CLDR data for the languages: de, en, es, fr, it, ja, ko, pt, ru, zh-Hans, and zh-Hant.  In the installation of `strong-globalize` in your package, you can replace the out-of-box `gz` file entirely, or add extra CLDR data to the `cldr` directory.

First, look for cldr_*.gz file(s) stored under `cldr` directory of `strong-globalize` The file name shows the CLDR version number `strong-globalize` uses.  Make sure you install `cldr-data` with the same version by `npm install`; for example, `npm install cldr-data@28.0.3`

After installing the compatible `cldr-data` package, edit LANGS array in `app.js` and run it by `node app.js`  The languages implemented by the `cldr-data` package are listed under cldr-data/main directory.  `cldr_version.gz` will be generated such as `cldr_28.0.3.gz`  Store the `gz` file under `cldr` directory of `strong-globalize` in `node_modules` of your package.

In runtime, `strong-globalize` dynamically loads in memory just the CLDR data required for the language specified by setDefaultLanguage().  First, it examines all the `gz` files under cldr directory in alphabetical order.  If the language is defined in two or more `gz` files, duplicate objects will be overwritten in the examination order.


```js
	$node app.js
	
```
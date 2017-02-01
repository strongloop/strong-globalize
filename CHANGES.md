2017-02-01, Version 2.8.2
=========================

 * Improve console logs in browser (Miroslav Bajtoš)


2017-02-01, Version 2.8.1
=========================

 * Fix rfc5424 loggers in browser (Miroslav Bajtoš)

 * Set theme jekyll-theme-cayman (Tetsuo Seto)

 * Set theme jekyll-theme-slate (Tetsuo Seto)

 * Delete CNAME (Tetsuo Seto)

 * Update (Tetsuo Seto)

 * Set theme jekyll-theme-cayman and migrate Page Generator content (Tetsuo Seto)

 * Create CNAME (Tetsuo Seto)

 * Create master branch via GitHub (Tetsuo Seto)

 * Avoid insecure minmatch 2.x dependency (Setogit)


2016-09-21, Version 2.8.0
=========================

 * Update README (Setogit)

 * Allow root dir instead of an option (Sam Roberts)

 * Remove Unicode BOM (Setogit)

 * Remove 32 char hash from file name in -d mode (Setogit)


2016-09-15, Version 2.7.0
=========================

 * Detect strong-globalize in shared module (Miroslav Bajtoš)


2016-09-02, Version 2.6.10
==========================

 * Fall back to md5 if getHash is undefined (Setogit)


2016-08-31, Version 2.6.9
=========================

 * Use string notation for one line regex (Setogit)

 * Add comment to say why some have '\n' (Setogit)

 * Suppress the heart-beat dots in the log (Setogit)

 * Remove headerIncluded test (Setogit)

 * Add plain text and other test cases (Setogit)

 * Make it work for windows (Setogit)

 * Clean up lint (Setogit)

 * Remove commented-out functions (Setogit)

 * Add more extract test cases (Setogit)

 * Add unhappy extract cases (Setogit)

 * Remove old debug code; add pseudoloc tests (Setogit)

 * Improve HTML extraction test (Setogit)

 * Improve test coverage (Setogit)

 * deps: import globalize and cldrjs packages (Ryan Graham)

 * Sort extracted and translated msges by keys (Setogit)

 * deps: upgrade to tap v7 (Ryan Graham)

 * test: report coverage for untested files (Ryan Graham)

 * test: use inclusive filter for coverage (Ryan Graham)

 * test: use tap's coverage instead of nyc (Ryan Graham)

 * Add regex test and fix a bug (Setogit)

 * Fix a bug in headerIncluded and add test (Setogit)

 * Cache results of md5 calls (Miroslav Bajtoš)

 * Reuse messages formatters (Miroslav Bajtoš)

 * benchmark: fix format benchmark (Miroslav Bajtoš)

 * Enable translate tests on travis (Setogit)

 * Add two more string test cases (Setogit)

 * Add test (Setogit)

 * Round to positive integer then bound (Setogit)

 * Handle null case (Setogit)


2016-08-20, Version 2.6.8
=========================

 * Silent API Calls and Tests (Setogit)

 * fix eslint config and all the linting errors (Ryan Graham)


2016-08-15, Version 2.6.7
=========================

 * Avoid JSON.stringify when debug is disabled (Miroslav Bajtoš)

 * Speed up formatMsg for lang=EN and path not found (Miroslav Bajtoš)

 * Add benchmark for g.f() (Miroslav Bajtoš)


2016-08-08, Version 2.6.6
=========================

 * Move mktmpdir to dependencies (Miroslav Bajtoš)


2016-08-07, Version 2.6.5
=========================

 * Split messages.json to mitigate GPB restriction (Setogit)

 * Improve require resolution performance (Tetsuo Seto)


2016-08-06, Version 2.6.4
=========================

 * Use non-greedy {{ }} matching (Setogit)


2016-08-06, Version 2.6.3
=========================

 * Improve lint logic and update README (Setogit)


2016-08-03, Version 2.6.2
=========================

 * Keep empty string in mapping args (Setogit)

 * Fix left & right orphan detecton logic (Setogit)


2016-08-01, Version 2.6.1
=========================

 * Keep 'undefined' and 'null' values in mapping args (Setogit)

 * Improve README (Setogit)


2016-07-28, Version 2.6.0
=========================

 * Remove {{ }} if falls back to original literal (Setogit)

 * Clean up README (Setogit)

 * Expand the out-of-box CLDR to 31 languages (Setogit)

 * Rename to avoid GPB confict; Del gz in .gitignore (Setogit)

 * test: fix empty subtest in TAP output (Ryan Graham)

 * test: don't polute TAP output with test debug (Ryan Graham)

 * remove references to gzip'd CLDR data (Ryan Graham)


2016-07-25, Version 2.5.8
=========================

 * Support windows for cldr data postinstall (Setogit)


2016-07-24, Version 2.5.7
=========================

 * Use unzipped JSON and remove zlib-backport (Setogit)

 * Adjust test cases for GPB GA (Setogit)


2016-07-21, Version 2.5.6
=========================

 * Bump the version to get swagger-client bug fix (Setogit)

 * Fix a link in README (Setogit)

 * Use html build badge link for npmjs.com (Setogit)


2016-07-11, Version 2.5.5
=========================

 * Update g11n-pipeline to 1.2.0 (Setogit)

 * Use coveralls to monitor test coverage (Setogit)

 * Add browser.js (Setogit)


2016-07-10, Version 2.5.4
=========================

 * Add minimal browser support (Setogit)


2016-07-10, Version 2.5.3
=========================

 * Avoid redundant zlib require in Node v0.10 (Setogit)

 * Fix a windows json/yaml extract test failure (Setogit)


2016-07-07, Version 2.5.2
=========================

 * Support yaml extension; skip if non-GLB_FN arguments (Setogit)


2016-06-28, Version 2.5.1
=========================

 * Support YAML File Globalization (Setogit)

 * Improve JSON file globalization sample code (Tetsuo Seto)


2016-06-26, Version 2.5.0
=========================

 * Add 'JSON File Globalization' section to README (Setogit)

 * Support extract from json file (Setogit)

 * Add format json test for multiple languages (Setogit)

 * Add normalizeKeyArrays validation (Setogit)

 * Remove an extra semicolon (Setogit)

 * Add scanJson, replaceJson and unit test (Tetsuo Seto)

 * Catch error if invalid path is passed to realpathSync (Setogit)


2016-06-17, Version 2.4.7
=========================

 * Explain sample codes and three strong-globalize coding patterns (Setogit)

 * Enable travis-ci.org build (Setogit)

 * Deprecated Node 0.10; added 4.4.5, 5.11.1, 6.2.1 to the tested versions (Setogit)

 * Format JavaScript code piece as JS in README (Setogit)

 * Add examples (Setogit)

 * Update readme and add callee information to zz/messages*.json (Setogit)


2016-06-04, Version 2.4.6
=========================

 * Use realpath to see if the file has been checked (perf) (Setogit)

 * Convert to array if string in inverting position text (Setogit)

 * Add setRootDir test (Setogit)

 * Fix typo (Candy)

 * Make sure intl directory exists in setRootDir (Setogit)

 * Relax test target to accomodate to GPB change (Setogit)

 * Remove unused code (Setogit)

 * Remove duplicate code (Setogit)


2016-05-25, Version 2.4.5
=========================

 * Emit JS and HTML syntax errors in regular exraction mode (Setogit)

 * Pass temporary GPB connection failure (Setogit)


2016-05-22, Version 2.4.4
=========================

 * Skip translate tests when offline (Setogit)


2016-05-22, Version 2.4.3
=========================

 * Add failure-case translate tests stubbing service response (Setogit)


2016-05-18, Version 2.4.2
=========================

 * Add more lint tests: (Setogit)

 * Update to CLDR 29.0.1 (Setogit)


2016-05-16, Version 2.4.1
=========================

 * Add more lint, extract, globalize, and translate tests (Setogit)

 * All packages are created equal (Setogit)

 * Skip translate test if internet access fails (Setogit)


2016-05-10, Version 2.4.0
=========================

 * Autonomous Message Loading (Setogit)


2016-05-07, Version 2.3.3
=========================

 * update copyright notices and license (Ryan Graham)


2016-05-06, Version 2.3.2
=========================

 * Support filtering of extracted hard-coded strings (Setogit)

 * Resolve multi-level symbolic links (Setogit)

 * Generate zz/messages_inverted.json in -e and -d modes (Setogit)

 * Assert if nothing is passed to setRootDir (Setogit)


2016-04-30, Version 2.3.1
=========================

 * Scan Html in 'slt-globalize -e' mode only (Setogit)

 * Avoid redundant directory scan (perf) (Setogit)

 * Skip redundant En lint check against En (Setogit)


2016-04-26, Version 2.3.0
=========================

 * Deep String Resource Extraction (Setogit)


2016-04-23, Version 2.2.9
=========================

 * Remove assert (Tetsuo Seto)


2016-04-22, Version 2.2.8
=========================

 * Record all literal positions appear in the first argument of calls (Setogit)


2016-04-19, Version 2.2.7
=========================

 * Unlist 'zz' from supported languages (Tetsuo Seto)

 * Clean up lint errors detected on windows (Setogit)


2016-04-19, Version 2.2.6
=========================

 * Record positions of all detected messages: hashed or not (Setogit)


2016-04-17, Version 2.2.5
=========================

 * Add notes for 'pseudo localization support' (Setogit)

 * Pseudoloc: Get a string from env variable and add to every message (Setogit)

 * Improve the sample code (Setogit)

 * Support variations in 'globalize' html filter; Check max number of msges per file (Setogit)

 * Cleanup for readability (Setogit)

 * Adjust spacing in user messages (Setogit)

 * Exit from infinite check loop in case GPB is out of sync (Setogit)

 * Delete formatting conflict with Mark-Down styles (Setogit)

 * Simplify the iteration in test-extract (Setogit)

 * Make SetRootDir the single required entry point (Setogit)


2016-04-01, Version 2.2.4
=========================

 * Add test to load msges in child process and fixed the argument order of logFn (Setogit)


2016-03-25, Version 2.2.3
=========================

 * Remove backslash escape from quotation marks in MT results (Setogit)

 * Disable dependency scan in loadMsgFromFile by default (perf) (Setogit)

 * Add well known lang check to msg loading test (Setogit)


2016-03-22, Version 2.2.2
=========================

 * Add missing deep dependency (Setogit)


2016-03-22, Version 2.2.1
=========================

 * Add test to load msges from dependencies (Setogit)


2016-03-21, Version 2.2.0
=========================

 * Support npm v3 dependency resolution (Setogit)

 * Add npm package badge (Setogit)

 * Record version info of globalize packages (Setogit)

 * Rreturn null if package.json does not exist (Tetsuo Seto)

 * Minor fix up for language property of persistent logging (Setogit)


2016-02-21, Version 2.1.0
=========================

 * Update README (Setogit)

 * Generalize SetRootDir for indirect dependencies to load messages (Setogit)

 * Pass language to persistent logging callback (Setogit)

 * Fix a bug in sample code in README (Setogit)

 * Make extract error msg directly actionable (Tetsuo Seto)

 * Empty json shouldn't be created if no msgs are extracted (Tetsuo Seto)

 * Remove extra space in README (Setogit)


2016-02-17, Version 2.0.2
=========================

 * Remove extra indent from js code in README (Tetsuo Seto)


2016-02-17, Version 2.0.1
=========================

 * Fix typos and clean up README (Tetsuo Seto)


2016-02-16, Version 2.0.0
=========================

 * Support multiple StrongGlobalize instances (Tetsuo Seto)


2016-02-14, Version 1.4.1
=========================

 * Fix a lint error (Setogit)

 * Clean up README (Tetsuo Seto)


2016-02-13, Version 1.4.0
=========================

 * Support language customization (Tetsuo Seto)


2016-02-13, Version 1.3.1
=========================

 * Add more links and fix typos in README (Tetsuo Seto)


2016-02-12, Version 1.3.0
=========================

 * Make zlb backport optional consistency and readme cleanup (Tetsuo Seto)

 * Implement getSupportedLanguages (Setogit)

 * Use zlib backport to support Node v0.10 (merge v1.2.1) (Tetsuo Seto)

 * Make console log client controlable with enumerateFilesSync (Tetsuo Seto)

 * Add persistent logging test (Tetsuo Seto)

 * RFC 5424 syslog levels and misc logging levels (Tetsuo Seto)

 * Support persistent logging (Tetsuo Seto)


2016-02-12, Version 1.2.1
=========================

 * Use zlib backport to support Node v0.10 (Tetsuo Seto)


2016-02-10, Version 1.2.0
=========================



2016-02-10, Version 1.1.0
=========================

 * merge initial release (Setogit)

 * Remove cldr-data dependency Keep cldr-data 28.0.3 locally for the supported languages only Add alias 'f' for 'format' (Tetsuo Seto)

 * Move shared variables to global (Tetsuo Seto)


2016-02-04, Version 1.0.0
=========================

 * First release!

2016-04-23, Version 2.2.8
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

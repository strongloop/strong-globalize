var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = SG();
var gpbtestsub = require('gpbtestsub');

g.log(gpbtestsub.getHelpText());
g.log(g.f('User name is %s.', gpbtestsub.getUserName()));

var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = SG();
var gsub = require('gsub');

g.log(gsub.getHelpText());
g.log(g.f('User name is %s.', gsub.getUserName()));

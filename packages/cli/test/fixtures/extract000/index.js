const SG = require('strong-globalize');
SG.SetRootDir(__dirname);
const g = new SG();
const gsub = require('gsub');

g.log(gsub.getHelpText());
g.log(g.f('User name is %s.', gsub.getUserName()));

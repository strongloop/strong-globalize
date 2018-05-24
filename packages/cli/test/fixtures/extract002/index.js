let SG = require('strong-globalize');
SG.SetRootDir(__dirname);
let g = new SG();
let gsub = require('gsub');

g.log(gsub.getHelpText());
g.log(g.f('User name is %s.', gsub.getUserName()));

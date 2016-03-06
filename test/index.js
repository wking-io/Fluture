/*eslint complexity:0*/
'use strict';

import {expect} from 'chai';
import Mocha from 'mocha';
import path from 'path';
import glob from 'glob';

//Expose globals.
global.expect = expect;

//Set up Mocha.
const mocha = new Mocha;
mocha.ui('bdd');
mocha.reporter('spec');
mocha.checkLeaks();
mocha.fullTrace();
mocha.globals(['expect']);

//Try to run tests.
try{

  //Add files to mocha.
  const root = path.resolve(process.cwd(), process.argv[2] || 'test');
  glob.sync('**/*.test.js', {cwd: root})
  .forEach(name => mocha.addFile(path.join(root, name)));

  //Execute the runner.
  mocha.run(failures => {
    if(failures > 0){
      process.exit(failures);
    }
  });

}

//Catch any error, usually module related.
catch(err){
  process.stderr.write(err.stack || err.toString());
  process.exit(1);
}

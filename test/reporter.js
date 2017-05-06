const instanbul = require('istanbul');
const TestReporter = require('mocha/lib/reporters/list');

module.exports = function (runner){
  const collector = new instanbul.Collector();
  const reporter = new instanbul.Reporter();
  reporter.addAll(['lcov', 'json', 'text']);
  new TestReporter(runner);

  runner.on('end', function (){
    collector.add(global.__coverage__);

    try{
      reporter.write(collector, true, function(){});
    }catch(e){
      //eslint-disable-next-line no-console
      console.error('Failed to generate coverage report:', e.stack);
    }
  });
};

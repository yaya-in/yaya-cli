// 入口文件
const program = require('commander');
const path = require('path');

const {version} = require('./utils/constants');
const {mapActions}  = require('./utils/common');

Reflect.ownKeys(mapActions).forEach( key => {
  const action = mapActions[key];
  program.command(key)
  .alias(action.alias)
  .description(action.description)
  .action(async () => {
    if(key === '*') {
      console.log(action.description)
    }
    else {
      console.log(process.argv);
      await require(path.join(__dirname, key))(...process.argv.slice(2))
    }
  })
});

program.on('--help', () => {
  console.log('\nExapmles:');
  Reflect.ownKeys(mapActions).forEach(key => {
    mapActions[key].examples.forEach(example => {
      console.log(`${example}`)
    })
  })
});

program
.version(version)
.parse(process.argv);



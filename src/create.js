const inquirer = require('inquirer');
const {fnLoadingByOra, fetchRepostory} = require('./utils/common');


module.exports = async () => {
  const repos = await fnLoadingByOra(fetchRepostory, '正在连接仓库');
  console.log(repos);
  // inquirer.prompt([
  //   {
  //     type: 'confirm',
  //     name: 'test',
  //     message: '你确定使用这个吗',
  //     default: true
  //   }
  // ]).then(answers => {
  //   console.log( `结果为:${answers}`)
  // })

  const {repo} = await inquirer.prompt([
    {
      type: 'list',
      name: 'repo',
      message: '请选择一个要创建的项目',
      choices: repos
    }
  ]);
  console.log(`现在选择了${repo}`);

};

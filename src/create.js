const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const {copyTempToLocal} = require("./utils/common");
const {DANGER_COLOR} = require("./utils/constants");
const {TITLE_COLOR} = require("./utils/constants");
const {downDir} = require("./utils/common");
const {fnLoadingByOra, fetchRepostory,getTagLists} = require('./utils/common');
const fse = require('fs-extra');


const projectName = process.argv[3];
const filePath = path.join(path.resolve(), projectName);

module.exports = async () => {
  if(fse.pathExistsSync(filePath)){
    console.log(chalk.red(`error: ${filePath} file is exist`));
    process.exit()
  }

  const repos = await fnLoadingByOra(fetchRepostory, '连接仓库\n')();
  if(!repos) {
    console.log(chalk.hex(DANGER_COLOR).bold('repository is empty'));
    return;
  }

  const {repo} = await inquirer.prompt([
    {
      type: 'list',
      name: 'repo',
      message: '请选择一个要创建的项目',
      choices: repos
    }
  ]);
  // console.log(chalk.hex(TITLE_COLOR).bold(`------进入${repo}仓库------`));

  let tags = await fnLoadingByOra(getTagLists, `获取版本号`)(repo);
  if(!tags) throw new Error("repository' tags is empty");
  tags = tags.map(item => item.name);

  const {tag} = await inquirer.prompt([
    {
      type: 'list',
      name: 'tag',
      message: '请选择一个该项目的版本下载',
      choices: tags
    }
  ]);
  // console.log(chalk.hex(TITLE_COLOR).bold(`------拉取${repo}@${tag}------`));

  const target = await fnLoadingByOra(downDir, '获取内容\n')(repo, tag);
  // if(target){
  //   console.log( chalk.green.bold(`内容已下载至:${target}`))
  // }


  await copyTempToLocal(target, projectName)

};

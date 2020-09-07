const ora = require('ora');

const path = require('path');
const fse = require('fs-extra');
const chalk = require('chalk');
const Metalsmith = require('metalsmith');
const inquirer = require('inquirer');
const {promisify} = require('util');
const downloadGitRepo = require('download-git-repo');
const {WARNING_COLOR} = require("./constants");
const {TITLE_COLOR} = require("./constants");
const {downloadDirectory} = require("./constants");
const downloadGit = promisify(downloadGitRepo);
const fetch = require('node-fetch');
const handlebars = require('handlebars');
const commander = require('commander');


const GITHUB_URL = 'https://api.github.com';
const mapActions = {
  create: {
    alias: 'c',
    description: '创建一个项目',
    examples: [
      'tina create <project-name>'
    ]
  },
  addPage:{
    alias: 'ap',
    description: "在pages/下创建页面模板，并配置在module-config下",
    examples: [
      'tina addPage <page-name>'
    ]
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: []
  }
};
// 获取 组织或者项目下的所有仓库 /orgs/:org/repos  /users/:username/repos

const fnLoadingByOra = (fn, message) => async (...argv) => {
  const spinner = ora(message);
  spinner.color = 'yellow';
  spinner.start();
  let result = null;
  try {
    result = await fn(...argv);
    spinner.succeed();
    return result;
  }catch (e) {
    console.log('network error', e)
  }
};

const fetchRepostory = async () => {
  // 'https://api.github.com/orgs/yaya-in/repos'
  const response = await fetch(`${GITHUB_URL}/orgs/yaya-in/repos`);
  const data = await response.json();
  return data.map(item => item.name);
};

const getTagLists = async (repo) => {
  // https://api.github.com/repos/yaya-in/${repo}/tags
  const response = await fetch(`${GITHUB_URL}/repos/yaya-in/${repo}/tags`);
  const data = await response.json();
  return data
};

const downDir = async (repo, tag) => {
  let repositoryUrl = `yaya-in/${repo}`.trim();
  let  dest = `${downloadDirectory}/${repo}`.trim();
  if(tag) {
    repositoryUrl += `#${tag}`;
    dest += `/${tag}`
  }

  let isExist = null;
  try {
    console.log(chalk.hex(TITLE_COLOR).bold(`开始加载`));
    isExist = await fse.pathExists(dest);
    if(isExist) await fse.remove(dest);
    await async_downDir(repositoryUrl, dest);

  }catch (e) {
    chalk.hex(WARNING_COLOR).bold('check error')
  }

  return dest
};

async function async_downDir(repositoryUrl, dest) {
    try{
      // console.log(repositoryUrl, 'to', dest);
      await downloadGit(repositoryUrl, dest);
    }
    catch (e) {
      console.log(e);
    }
}

async function askFilehandler(askFilePath) {
  let asks = require(askFilePath);
  let replys = await inquirer.prompt(asks);
  return replys
}

/**
 * @param target : 暂存目录
 * @param projectName ： 命令行参数，用于设置文件夹名
 * @return {Promise<void>}
 */
const copyTempToLocal = async (target, projectName) => {
  // 命令行输入的项目文件夹名称
  const projectPath = path.resolve(projectName);
  // askjs的早缓存文件中的绝对路径
  const askFilePath = path.join(target, 'ask.js');
  // 命令行执行的当前目录的绝对路径
  const filePath = path.join(path.resolve(), projectName);

  // 如果askjs存在
  if(fse.pathExistsSync(askFilePath)){
    // 获取askjs的问题列表并使用inquirer插件
    let replys = await askFilehandler(askFilePath);

    Metalsmith(target)
    .source('./')
    .ignore(
      [
        askFilePath,
        `${target}/build`,
        `${target}/.git`,
        `${target}/.idea`,
        `${target}/node_modules`
      ]
    )
    .destination(filePath)
    .use((files,metal, done) => {
      Reflect.ownKeys(files).forEach( fileName => {
        if(fileName.includes('package.json')){
          let ctx = files[fileName].contents.toString();
          files[fileName].contents = Buffer.from(handlebars.compile(ctx)(replys))
        }
      });
      done()
    })
  .build(err => {
      if(err) {
        console.log(chalk.red('项目生成失败', err));
      }else {
        console.log(chalk.green('项目生成成功'));
      }
    })
  }
  else {
    try {
      await fse.copy(target, filePath);
      console.log(chalk.green('项目生成成功'));
    }
    catch (e) {
      console.log(e)
    }
  }

};


module.exports  = {
  mapActions,
  fnLoadingByOra,
  fetchRepostory,
  getTagLists,
  downDir,
  copyTempToLocal
};

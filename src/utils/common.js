const ora = require('ora');

const path = require('path');
const fse = require('fs-extra');
const chalk = require('chalk');
const Metalsmith = require('metalsmith');
const consolidate = require('consolidate');
const inquirer = require('inquirer');
const {promisify} = require('util');
const downloadGitRepo = require('download-git-repo');
const {WARNING_COLOR} = require("./constants");
const {TITLE_COLOR} = require("./constants");
const {downloadDirectory} = require("./constants");
const downloadGit = promisify(downloadGitRepo);

const axios = require('axios');
axios.defaults.timeout =  6000;

const GITHUB_URL = 'https://api.github.com';
const mapActions = {
  create: {
    alias: 'c',
    description: '创建一个项目',
    examples: [
      'tina create <project-name>'
    ]
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: [
      'tina config set <k> <v>',
      'tina config set <k>'
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
  const {data} = await axios.get(`${GITHUB_URL}/orgs/yaya-in/repos`);
  return data.map(item => item.name);
};

const getTagLists = async (repo) => {
  // https://api.github.com/repos/yaya-in/${repo}/tags
  const {data} = await axios.get(`${GITHUB_URL}/repos/yaya-in/${repo}/tags`);
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

    Metalsmith(__dirname)
    .source(target)
    .destination(filePath)
    .use((files,metal, done) => {
      const packageFileKey = Reflect.ownKeys(files).filter(items => items.includes('package.json'));
      const ctx = files[packageFileKey].contents.toString('utf8');

      if(ctx.includes('<%=')){
        const pkAbPath = path.join(target, packageFileKey[0]);
        consolidate.ejs(pkAbPath, replys, async (err, data) => {
          if(err) {
            return console.log(chalk.red(err))
          }else {
            files[packageFileKey].contents = Buffer.from(data, 'utf8');
            // 输出packagejson到缓存文件中
            await fse.outputFile(pkAbPath, data);
            // 移除缓存文件的askjs
            fse.remove(askFilePath).then(async resolve=>{
              // 拷贝缓存文件到项目中
              await fse.copy(target, filePath);
            });
            done()
          }
        })
      }else {}
    })
    .build(err => {
      if(err) {
        console.log(chalk.red('项目生成失败', err));
      }else {
        console.log(chalk.blue('项目生成成功'));
      }
    })
  }else {
    fse.copySync(target, filePath)
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

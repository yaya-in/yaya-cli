const ora = require('ora');
const axios = require('axios');
const path = require('path');
const fse = require('fs-extra');
const chalk = require('chalk');
const {promisify} = require('util');
const downloadGitRepo = require('download-git-repo');
const {WARNING_COLOR} = require("./constants");
const {TITLE_COLOR} = require("./constants");
const {downloadDirectory} = require("./constants");
const downloadGit = promisify(downloadGitRepo);

const GITHUB_URL = 'https://api.github.com';
const mapActions = {
  create: {
    alias: 'c',
    description: '创建一个项目',
    examples: [
      'tina-cli create <project-name>'
    ]
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: [
      'tina-cli config set <k> <v>',
      'tina-cli config set <k>'
    ]
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: []
  }
};

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
    if(!isExist) {
       await async_downDir(repositoryUrl, dest);
    }

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

/**
 * @param target : 暂存目录
 * @param projectName ： 命令行参数，用于设置文件夹名
 * @return {Promise<void>}
 */
const copyTempToLocal = async (target, projectName) => {
  const projectPath = path.resolve(projectName);
  const askFilePath = path.join(target, 'ask.js');
  const filePath = path.resolve()+ `/${projectName}`;

  if(fse.pathExistsSync(askFilePath)){

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

const process = require('process');
const path = require('path');
const fse = require('fs-extra');
const chalk = require('chalk');
const fs = require('fs');

const projectPath = path.resolve();
const pagesPath = path.join(projectPath, './src/pages');

module.exports = async () => {
  const existPagesFile = await fse.pathExists(pagesPath);
  if(!existPagesFile){
    console.log(chalk.red('can not find /Users/pundix0031/git/tina-cli/src/pages/'));
    process.exit()
  }
  const pageName = process.argv[3];
  // HTML文件写入
  const htmlData = '<!DOCTYPE html>\n' +
    '<html>\n' +
    '<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0,viewport-fit=cover">\n' +
    '  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
    '  <title></title>\n' +
    '</head>\n' +
    '<body>\n' +
    '</body>\n' +
    '</html>';
  fs.writeFile(`${pagesPath}/${pageName}.html`, htmlData, (err) => {

    if(err) {
      console.log(err);
      process.exit()
    }
    else {

    }

  });

  // CSS文件写入
  await fse.ensureFile(`${pagesPath}/${pageName}.css`);

  // JS文件写入
  const jsData = `import './${pageName}.css';\n console.log('${pageName} page');`;
  fs.writeFile(`${pagesPath}/${pageName}.js`, jsData, async err => {

    if(err) {
      console.log(err);
      process.exit()
    }
    else {
      const moduleFile = `${projectPath}/module-config.js`;
      const existModuleFile = await fse.pathExists(moduleFile);
      if(!existModuleFile){
        console.log(chalk.red(`can not find ${moduleFile}`));
        process.exit()
      }
      else {
        // 插入配置
        const pagesConfig = {
          moduelUrl: `../src/pages/${pageName}/${pageName}.js`,
          templateUrl: `../src/pages/${pageName}/${pageName}.html`,
          isPrefetch: false,
          isPreload: false
        };
        const configList = require(moduleFile);
        configList.push(pagesConfig);
        const configData = `module.exports = ${JSON.stringify(configList, null, 4)}`;
        fs.writeFile(moduleFile, configData, err => {
          if(err) {
            console.log(err);
            process.exit()
          }
          else {
            console.log(chalk.green('模板添加成功，请查看module-config配置文件做其他设置'));
          }
        })

      }
    }

  })

};

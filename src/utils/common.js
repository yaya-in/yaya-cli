const ora = require('ora');
const axios = require('axios');

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

const fnLoadingByOra = async (fn, message) => {
  const spinner = ora(message);
  spinner.color = 'yellow';
  spinner.start();
  let result = null;
  try {
    result = await fn();
    spinner.succeed('连接成功');
    return result;
  }catch (e) {
    console.log('network error')
  }
};

const fetchRepostory = async () => {
  const {data} = await axios.get('https://api.github.com/orgs/yaya-in/repos');
  // const {data} = await axios.get('https://api.github.com/orgs/lxy-cli/repos');
  return data.map(item => item.name);
};


module.exports  = {
  mapActions,
  fnLoadingByOra,
  fetchRepostory
};

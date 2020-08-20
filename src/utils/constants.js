const {name, version}  = require('../../package');
const downloadDirectory = `${process.env[process.platform === 'darwin'? 'HOME' : 'USERPROFILE']}/.yayaTemplate`;

const TITLE_COLOR = '#d28fe4';
const WARNING_COLOR = '#ff9632';
const DANGER_COLOR = '#f44336';

module.exports = {
  name,
  version,
  downloadDirectory,
  TITLE_COLOR,
  WARNING_COLOR,
  DANGER_COLOR
};

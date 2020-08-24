const {spawn}= require('child_process');

const workerProcess = spawn('npm', ['--version']);
workerProcess.stdout.on('data', data => {
  console.log(Buffer.from(data).toString('utf8'));
});





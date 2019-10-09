const _ = require('lodash');
const fs = require('fs');
const configPath = '/root/.posq/posq.conf';
const exec = require('child_process').exec;

module.exports = (app) => {
    app.get('/sayhello', (req, res) => {
      res.json('Hello World');
    });
    
    app.post('/externalip', (req, res) => {
      const externalIp = req.body.externalIp;
      setExternalIp(configPath, externalIp);
      res.json(externalIp);
    });
    
    app.post('/startdaemon', (req, res) => {
      startPOSQDaemon();
      res.json('Started');
    });
}

function setExternalIp(filePath, ipAddress) {
  readWriteFileSync(filePath, 'externalip=', 'externalip=' + ipAddress);
}

function readWriteFileSync(filePath, searchFor, replaceWith) {
  const data = fs.readFileSync(filePath, 'utf-8');
  const newValue = data.replace(searchFor, replaceWith);

  fs.writeFileSync(filePath, newValue, 'utf-8');
}

function startPOSQDaemon() {
  exec('sudo /root/posq_ubuntu/posqd', function(err, stdout, stderr) {
    console.error(err);
  });
}
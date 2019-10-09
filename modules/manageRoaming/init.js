
const util = require('../util/util');
const userSettings = require('../user/settings');

//addnode=178.62.195.16
//addnode=178.62.221.33

const defaultPOSQConf =
`##
## posq.conf configuration file. Lines beginning with # are comments.
##

rpcuser=RandomName
rpcpassword=SuperSecretRandomPasswordChangeOrBePwned
rpcport=5511
rpcallowip=127.0.0.1
rpcconnect=127.0.0.1

daemon=1

## mnposqaddress=D97SEoJDksK1NieZuuFP85JGpFkzPY1rnj
`;

const defaultPOSQTestnetConf =
`##
## posq.conf configuration file. Lines beginning with # are comments.
##

rpcuser=RandomName
rpcpassword=SuperSecretRandomPasswordChangeOrBePwned
rpcport=15511
rpcallowip=127.0.0.1
rpcconnect=127.0.0.1

addnode=104.248.86.122
addnode=104.248.86.121

daemon=1
testnet=1

## mnposqaddress=D97SEoJDksK1NieZuuFP85JGpFkzPY1rnj
`;

exports.initFolders = (testnet) => {
  if (testnet) {
    util.createMissingFolder(util.getRoamingTestNetPath());
  } else {
    util.createMissingFolder(util.getRoamingPOSQPath());
  }
  util.createMissingFile(util.posqConfFilePath(testnet));
}

exports.initPOSQConf = (testnet) => {
  return new Promise((resolve, reject) => {
    util.appendFile('posq', testnet ? defaultPOSQTestnetConf : defaultPOSQConf, testnet, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

exports.unblockDaemon = (testnet) => {
  return new Promise((resolve, reject) => {
    let chainstatePath;
    let blocksPath;
    if (testnet) {
      chainstatePath = util.getRoamingTestNet3Path('chainstate');
      blocksPath = util.getRoamingTestNet3Path('blocks');
    } else {
      chainstatePath = util.getRoamingPOSQPath('chainstate');
      blocksPath = util.getRoamingPOSQPath('blocks');
    }
    util.deleteFolderRecursive(blocksPath);
    util.deleteFolderRecursive(chainstatePath);
    resolve();
  });
};

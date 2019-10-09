const fs = require('fs');

console.log('Removing POSQ files');

const appPath = process.cwd().replace('uninstall', '');

console.log(appPath);
console.log('Uninstall process started');

if (appPath.toLowerCase().indexOf('posq') <= 0) {
  console.log('Not POSQ directory. Exiting');
  return;
}

setTimeout(() => {
  removeBinaries(appPath);
  removeUserData();
  removePOSQDesktop();
}, 10000);

function removeBinaries(appPath) {
  console.log('Removing app folder');

  removeFolder(appPath);
}

function removePOSQDesktop() {
  const posqDesktopPath = getRoamingPOSQDesktopPath();

  removeFolder(posqDesktopPath);
}

function removeUserData() {
  const livePath = getRoamingPOSQPath();
  const testnetPath = getRoamingTestNetPath();

  console.log('Removing user data');

  removeFolder(livePath);
  removeFolder(testnetPath);
}

function removeFolder(path) {
  if(fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      let curPath = path + '/' + file;
console.log(curPath);
      if(fs.lstatSync(curPath).isDirectory()) {
        removeFolder(curPath);
      } else {
        try {
          if (curPath.indexOf('uninstall') <= 0) {
            console.log(`Removing file: ${curPath}`);
            fs.unlinkSync(curPath);
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
    try {
      if (path.indexOf('uninstall') <= 0) {
        console.log(`Removing directory: ${path}`);
        fs.rmdirSync(path);
      }
    } catch (e) {
      console.log(e);
    }
  }
}

function getRoamingPOSQPath() {
  switch (process.platform) {
    case 'win32':
      return process.env.APPDATA + "\\POSQ\\";
    case 'darwin':
      return process.env.HOME + "/Library/Application\ Support/POSQ/";
    default:
      return process.env.HOME + "/.posq/";
  }
}

function getRoamingPOSQDesktopPath() {
  switch (process.platform) {
    case 'win32':
      return process.env.APPDATA +"\\POSQ\ Desktop\\";
    case 'darwin':
      return process.env.HOME + "/Library/Application\ Support/POSQ\ Desktop/";
    default:
      return process.env.HOME + "/.config/posq-desktop/";
  }
}

function getRoamingTestNetPath() {
  switch (process.platform) {
    case 'win32':
      return process.env.APPDATA + "\\POSQTEST\\";
    case 'darwin':
      return process.env.HOME + "/Library/Application\ Support/POSQTEST/";
    default:
      return process.env.HOME + "/.posqtest/";
  }
}
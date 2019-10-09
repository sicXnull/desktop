declare const require: any;

export const environment = {
  production: true,
  version: require('../../package.json').version,
  releasesUrl: 'https://github.com/POSQcoin/posq-desktop/releases/latest',
  envName: 'prod'
};

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const getLatestVersion = require('./utils/getLatestVersion');
const isUnix = process.platform !== 'win32';

async function isInstaClientExist(STAGE = 0) {
  try {
    const contents = fs.readdirSync(__dirname + '/bin', { withFileTypes: true });
    const instantClient = contents.find(
      (content) => content.isDirectory() && content.name.startsWith('instantclient')
    );
    if (!instantClient) return false;
    return path.resolve(__dirname + '/bin/' + instantClient.name);
  } catch (error) {
    if (STAGE === 0) return false;
    throw error;
  }
}

function downloadClient(downloadLink) {
  return new Promise((resolve) => {
    const client = fs.createWriteStream(__dirname + '/bin/file.zip');
    let downloadLength = 0;
    https.get('https://' + downloadLink, (res) => {
      res.on('data', (chunk) => {
        downloadLength += chunk.length;
        process.stdout.write(
          `\rDownload: ${((downloadLength * 100) / res.headers['content-length']).toFixed(2)}%`
        );
      });
      res.pipe(client);
      client.on('finish', resolve);
    });
  });
}

module.exports = async () => {
  const alreadyExist = await isInstaClientExist();
  if (alreadyExist) return alreadyExist;
  const downloadLink = await getLatestVersion(isUnix);
  process.stdout.write('Download: 0%');
  await downloadClient(downloadLink);
  const unzip = isUnix ? 'unzip' : __dirname + '/bin/unzip.exe';
  execFileSync(unzip, ['-q', __dirname + '/bin/file.zip', '-d', __dirname + '/bin']);
  const currentPath = await isInstaClientExist(1);
  const bs_index = currentPath.indexOf('instantclient');
  const newPath = currentPath.slice(0, bs_index) + 'instantclient';
  fs.renameSync(currentPath, newPath);
  fs.rmSync(currentPath.slice(0, bs_index) + 'file.zip')
  return newPath;
};
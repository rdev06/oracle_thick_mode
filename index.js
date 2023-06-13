const https = require('https');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const isLinux = process.platform !== 'win32';

async function isInstaClientExist(STAGE = 0) {
  try {
    const contents = fs.readdirSync('bin', { withFileTypes: true });
    const instantClient = contents.find(
      (content) => content.isDirectory() && content.name.startsWith('instantclient')
    );
    if (!instantClient) return false;
    return path.resolve('bin/' + instantClient.name);
  } catch (error) {
    if (STAGE === 0) return false;
    throw error;
  }
}

function getLatestVersion() {
  const platform = isLinux ? 'linux-x86-64' : 'winx64-64';
  return new Promise((resolve, reject) => {
    https.get(
      `https://www.oracle.com/database/technologies/instant-client/${platform}-downloads.html`,
      (res) => {
        if (res.statusCode != 200)
          return reject(new Error('Try to download binaries manualy for oracle instaclient'));
        let htmlContent = '';
        res.on('data', (chunk) => (htmlContent += chunk));
        res.on('end', () => {
          const latestVHtmlComponent = htmlContent
            .split('\n')
            .find(
              (e) =>
                e.includes(
                  `download.oracle.com/otn_software/${isLinux ? 'linux' : 'nt'}/instantclient/`
                ) && e.includes(`/instantclient-basiclite-${isLinux ? 'linux' : 'windows'}.x64-`)
            );
          const startIndex = latestVHtmlComponent.indexOf('download.oracle.com');
          const endIndex = latestVHtmlComponent.indexOf(`.zip'`);
          return resolve(latestVHtmlComponent.slice(startIndex, endIndex + 4));
        });
      }
    );
  });
}

function downloadClient(downloadLink) {
  return new Promise((resolve) => {
    const client = fs.createWriteStream('bin/file.zip');
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
  const downloadLink = await getLatestVersion();
  //   const downloadLink = 'download.oracle.com/otn_software/nt/instantclient/2110000/instantclient-basiclite-windows.x64-21.10.0.0.0dbru.zip';
  process.stdout.write('Download: 0%');
  await downloadClient(downloadLink);
  const unzip = isLinux ? 'unzip' : 'bin/unzip.exe';
  execFileSync(unzip, ['-q', 'bin/file.zip', '-d', 'bin']);
  return isInstaClientExist(1);
};

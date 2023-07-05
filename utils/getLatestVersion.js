const https = require('https');
module.exports = async (isUnix) => {
  let platform, software, client;

  if (!isUnix) {
    platform = 'winx64-64';
    software = 'nt';
    client = 'windows';
  } else {
    if (process.platform == 'darwin') {
      platform = 'macos-intel-x86';
      software = 'mac';
      client = 'macos';
    } else {
      platform = 'linux-x86-64';
      software = 'linux';
      client = 'linux';
    }
  }

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
                e.includes(`download.oracle.com/otn_software/${software}/instantclient/`) &&
                e.includes(`/instantclient-basiclite-${client}.x64-`)
            );
          const startIndex = latestVHtmlComponent.indexOf('download.oracle.com');
          const endIndex = latestVHtmlComponent.indexOf(`.zip'`);
          return resolve(latestVHtmlComponent.slice(startIndex, endIndex + 4));
        });
        res.on('error', reject);
      }
    );
  });
};

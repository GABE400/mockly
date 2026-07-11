const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontUrls = [
  {
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff',
    dest: path.join(fontsDir, 'inter-latin-400-normal.woff')
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff',
    dest: path.join(fontsDir, 'inter-latin-700-normal.woff')
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (status code: ${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Downloaded ${path.basename(dest)}`);
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  try {
    for (const font of fontUrls) {
      console.log(`Downloading ${font.url}...`);
      await download(font.url, font.dest);
    }
    console.log('All fonts downloaded successfully!');
  } catch (err) {
    console.error('Error downloading fonts:', err);
    process.exit(1);
  }
}

run();

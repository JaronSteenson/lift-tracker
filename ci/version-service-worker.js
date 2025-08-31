const fs = require('fs');
const path = require('path');

const filePathIn = path.resolve(
    __dirname,
    '../resources/service-worker.template.js',
);
const filePathOut = path.resolve(__dirname, '../dist/service-worker.js');

const timeStampForLocalDev = Date.now().toString();
const cacheKey =
    process.env?.BITBUCKET_COMMIT?.slice(0, 7) || timeStampForLocalDev;

console.log(`🛠️ Injecting cache key: ${cacheKey} into ${filePathIn}`, '\r\n');

try {
    let serviceWorker = fs.readFileSync(filePathIn, 'utf8');
    serviceWorker = serviceWorker.replace(/\{CACHE_KEY\}/g, cacheKey);
    fs.writeFileSync(filePathOut, serviceWorker, 'utf8');

    console.log(
        `🚀 service-worker.js versioned successfully at ${filePathOut}`,
        '\r\n',
    );
} catch (err) {
    console.error('❌ Failed to version service-worker.js:', err);
    process.exit(1);
}

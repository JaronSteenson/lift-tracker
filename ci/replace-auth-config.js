const fs = require('fs');

console.log('Current working directory:', process.cwd()); // Debugging.

let template = fs.readFileSync('config.template.json', 'utf8');

template = template
    .replace('${AUTH0_DOMAIN}', process.env.AUTH0_DOMAIN)
    .replace('${AUTH0_CLIENT_ID}', process.env.AUTH0_CLIENT_ID)
    .replace('${AUTH0_AUDIENCE}', process.env.AUTH0_AUDIENCE)
    .replace(
        '${NEW_RELIC_APPLICATION_ID}',
        process.env.NEW_RELIC_APPLICATION_ID,
    )
    .replace('${NEW_RELIC_LICENSE_KEY}', process.env.NEW_RELIC_LICENSE_KEY);

fs.writeFileSync('config.json', template);

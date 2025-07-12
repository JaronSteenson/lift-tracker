const fs = require('fs');

let template = fs.readFileSync('auth_config.template.json', 'utf8');

template = template
    .replace('${AUTH0_DOMAIN}', process.env.AUTH0_DOMAIN)
    .replace('${AUTH0_CLIENT_ID}', process.env.AUTH0_CLIENT_ID)
    .replace('${AUTH0_AUDIENCE}', process.env.AUTH0_AUDIENCE);

fs.writeFileSync('auth_config.json', template);

const fs = require('fs');

console.log('Current working directory:', process.cwd()); // Debugging.

let template = fs.readFileSync('auth_config.template.js', 'utf8');

template = template
    .replace('${AUTH0_DOMAIN}', process.env.AUTH0_DOMAIN)
    .replace('${AUTH0_CLIENT_ID}', process.env.AUTH0_CLIENT_ID)
    .replace('${AUTH0_AUDIENCE}', process.env.AUTH0_AUDIENCE);

fs.writeFileSync('public/auth_config.js', template); // Debugging.
fs.writeFileSync('auth_config.js', template);

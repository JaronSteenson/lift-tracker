const fs = require('fs');
const stubOnly = Boolean(process.argv[2]);

console.log(
    stubOnly
        ? '🛠️ Building config with test stubs'
        : '🛠️ Building config with production values',
);

let template = fs.readFileSync('config.template.json', 'utf8');

// Replace all ${VAR_NAME} with process.env.VAR_NAME
template = template.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => {
    const value = stubOnly ? `test-stub-${varName}` : process.env[varName];
    if (value === undefined) {
        console.warn(`⚠️ Warning: Environment variable ${varName} is not set`);
        return match; // leave placeholder unchanged
    }

    console.info(`✅ Environment variable ${varName} was set`);
    return value;
});

fs.writeFileSync('config.json', template);
console.log('🚀 config.json generated');

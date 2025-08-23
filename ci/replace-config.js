const fs = require('fs');

console.log('Current working directory:', process.cwd());

let template = fs.readFileSync('config.template.json', 'utf8');

// Replace all ${VAR_NAME} with process.env.VAR_NAME
template = template.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => {
    const value = process.env[varName];
    if (value === undefined) {
        console.warn(`⚠️ Warning: Environment variable ${varName} is not set`);
        return match; // leave placeholder unchanged
    }

    console.info(`✅ Info: Environment variable ${varName} has set`);
    return value;
});

fs.writeFileSync('config.json', template);
console.log('✅ config.json generated');

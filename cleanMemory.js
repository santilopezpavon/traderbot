import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fs = require('fs');

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configuration = require('./config.json');

console.log(__dirname);

const names = ["memory-buy", configuration.memory.data];
const basePath = __dirname + '/src/Memory/';

for (let index = 0; index < names.length; index++) {
    const name = names[index];
    const path = basePath + name + ".json";
    try {
        fs.unlinkSync(path)
    } catch (err) {
        console.error(err)
    }
}

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fs = require('fs');

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getFilesService(nameFile = "data") {
    return new Memory(nameFile);
}

class Memory {

    constructor(nameFile) {

        this.filePath = __dirname + '/' + nameFile + '.json';
    }



    saveFile(objToSave) {
        let data = JSON.stringify(objToSave);
        fs.writeFileSync(this.filePath, data, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        });
    }

    loadFile() {
        if (fs.existsSync(this.filePath)) {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        }
        return false;
    }


    loadFileCheckEmpty(str) {
        const file = this.loadFile();
        if (typeof file === 'object') {
            return file;
        }
        return false;
    }

    addItemFile(newItem) {
        const file = this.loadFile();
        if(file === false) {
            this.saveFile([newItem]);
        } else {
            file.push(newItem);
            this.saveFile(file);
        }
    }

    addItemFileObject(newItem, keyProp) {
        const file = this.loadFile();

        const keyValue = newItem[keyProp];

        let objectSave = {}
        objectSave[keyValue] = newItem      


        if(file === false) {           
            this.saveFile(objectSave);
        } else {
            let objectSave2 = {...file, ...objectSave};
            this.saveFile(objectSave2);
        }
    }

}


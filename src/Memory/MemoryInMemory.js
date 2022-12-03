import {getFilesService} from "../Memory/Memory.js";

export function getMemoryInMemory() {
    return MemoryInMemory.getInstance();
}

class MemoryInMemory {

    static #instance;

    memory;

    fileService;

    static getInstance() {
        if (!MemoryInMemory.#instance) {
            MemoryInMemory.#instance = new MemoryInMemory()
        }
        return MemoryInMemory.#instance
    }

    constructor() {
        this.memory = {};
        this.memoryLongTerm = {};
        this.fileService = getFilesService("memory-buy");
    }

    set(prop, value) {
        this.memory[prop] = value;
    }

    get(prop) {
        if(this.memory.hasOwnProperty(prop)) {
            return this.memory[prop];
        }
        return false;        
    }

    setPermanent(prop, value) {
        let memoryLong = this.fileService.loadFile();
        if(memoryLong === false) {
            memoryLong = {};
        }
        memoryLong[prop] = value;
        this.fileService.saveFile(memoryLong);
    }

    getPermanent(prop) {
        const memoryLong = this.fileService.loadFile();
        if(memoryLong.hasOwnProperty(prop)) {
            return memoryLong[prop];
        }
        return false;        
    }

}






"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const colors_1 = require("./utils/colors");
class Logger {
    constructor(prefix = 'Logger') {
        this.prefix = prefix;
    }
    _log(level, ...args) {
        let color = colors_1.colors.green;
        switch (level) {
            case 'WARN':
                color = colors_1.colors.yellow;
                break;
            case 'ERROR':
                color = colors_1.colors.red;
                break;
        }
        const date = new Date().toLocaleString();
        console.log(color(`[Lambda] ${process.pid}  -`), colors_1.colors.reset(date), colors_1.colors.yellow(`  [${this.prefix}]`), ...args);
    }
    log(...args) {
        this._log('INFO', ...args);
    }
    warn(...args) {
        this._log('WARN', ...args);
    }
    error(...args) {
        this._log('ERROR', ...args);
    }
}
exports.Logger = Logger;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = void 0;
exports.colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    reset: (text) => `\x1b[0m${text}\x1b[0m`,
};

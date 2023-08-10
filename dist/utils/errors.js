"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustAsync = exports.must = void 0;
function must(run, fail) {
    try {
        return run();
    }
    catch (error) {
        fail(error);
        process.exit(1);
    }
}
exports.must = must;
function mustAsync(run, fail) {
    return run().catch((error) => {
        fail(error);
        process.exit(1);
    });
}
exports.mustAsync = mustAsync;

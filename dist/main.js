#!/usr/bin/env tsx
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = require("node:path");
const logger_1 = require("./logger");
const errors_1 = require("./utils/errors");
function validateConfig(json) {
    let data;
    try {
        data = JSON.parse(json);
    }
    catch (err) {
        throw new Error('Invalid config file, make sure to use a valid JSON.');
    }
    if (typeof data !== 'object') {
        throw new Error('Invalid config file, make sure to use a valid JSON.');
    }
    if (typeof data.path !== 'string') {
        throw new Error('"path" must be a string.');
    }
    if (typeof data.file !== 'string') {
        throw new Error('"file" must be a string.');
    }
    if (data.port && typeof data.port !== 'number') {
        throw new Error('"port" must be a number.');
    }
    return {
        path: data.path,
        file: data.file,
        port: data.port || 3000,
    };
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const logger = new logger_1.Logger('Bootstrap');
        const { port, path, file } = yield (0, errors_1.mustAsync)(() => {
            return promises_1.default
                .readFile((0, node_path_1.join)(process.cwd(), '.xsls.json'), 'utf-8')
                .then((config) => validateConfig(config));
        }, (err) => {
            logger.error('Could not parse config file, make sure configure a ".xsls.json" file in the root of your project.');
            logger.error(err.message);
        });
        logger.log(`Initializing server`);
        logger.log(`Mapped route: ${path}`);
        const handler = (0, errors_1.must)(() => {
            return require((0, node_path_1.join)(process.cwd(), file))
                .handler;
        }, (err) => {
            logger.error('Failed to load specified handler, make sure it is a valid path.');
            logger.error('Reason:', err.message);
        });
        app.use(path, (req, res) => {
            var _a;
            const logger = new logger_1.Logger('Handler');
            const start = Date.now();
            res.on('finish', () => {
                const time = Date.now() - start;
                const msg = `${req.method} ${req.originalUrl} ${time}ms - ${req.headers['user-agent']} ${req.ip}`;
                if (res.statusCode >= 400) {
                    logger.error(msg);
                }
                else {
                    logger.log(msg);
                }
            });
            const headers = Object.entries(req.headers)
                .filter(([_, value]) => !Array.isArray(value))
                .reduce((headers, [key, value]) => (Object.assign(Object.assign({}, headers), { [key]: value })), {});
            const multiValueHeaders = Object.entries(req.headers)
                .filter(([_, value]) => Array.isArray(value))
                .reduce((headers, [key, value]) => (Object.assign(Object.assign({}, headers), { [key]: value })), {});
            const output = handler({
                body: (_a = req.body) !== null && _a !== void 0 ? _a : null,
                headers: headers,
                httpMethod: req.method,
                isBase64Encoded: false,
                path: req.path,
                pathParameters: req.params,
                queryStringParameters: req.query,
                multiValueHeaders: multiValueHeaders,
                multiValueQueryStringParameters: null,
                requestContext: null,
                resource: null,
                stageVariables: null,
            }, {
                awsRequestId: '0e22683c-3fd2-4423-8922-b8d378ca24cb',
                callbackWaitsForEmptyEventLoop: true,
                functionName: 'handler',
                functionVersion: '1.0',
                invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:custom-runtime',
                memoryLimitInMB: '128MB',
                getRemainingTimeInMillis: () => Infinity,
                logGroupName: 'none',
                logStreamName: 'none',
                done: (error, result) => {
                    if (error) {
                        throw error;
                    }
                    if (result) {
                        res.status(result.statusCode);
                        if (result.headers) {
                            Object.entries(result.headers).forEach(([key, value]) => {
                                res.setHeader(key, String(value));
                            });
                        }
                        res.send(result.body);
                    }
                },
                fail: (error) => {
                    return res.status(500).json({
                        error: error instanceof Error ? error.message : error,
                    });
                },
                succeed: (...args) => {
                    throw new Error('Unimplemented');
                },
            }, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: err instanceof Error ? err.message : err,
                    });
                }
                if (result) {
                    res.status(result.statusCode);
                    if (result.headers) {
                        Object.entries(result.headers).forEach(([key, value]) => {
                            res.setHeader(key, String(value));
                        });
                    }
                    res.send(result.body);
                }
                res.end();
            });
            if (output instanceof Promise) {
                return output
                    .then((result) => {
                    res.status(result.statusCode);
                    if (result.headers) {
                        Object.entries(result.headers).forEach(([key, value]) => {
                            res.setHeader(key, String(value));
                        });
                    }
                    res.send(result.body);
                })
                    .catch((err) => {
                    return res.status(500).json({
                        error: err instanceof Error ? err.message : err,
                    });
                });
            }
            return res.end();
        });
        app.listen(port, () => {
            logger.log(`Server has initialized successfully`);
            logger.log(`Listening on address: http://localhost:${port}`);
        });
    });
}
run();

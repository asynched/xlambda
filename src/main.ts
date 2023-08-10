#!/usr/bin/env tsx

import express from 'express'
import fs from 'node:fs/promises'
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { join } from 'node:path'
import { Logger } from './logger'
import { must, mustAsync } from './utils/errors'

function validateConfig(json: string) {
  let data: any

  try {
    data = JSON.parse(json)
  } catch (err) {
    throw new Error('Invalid config file, make sure to use a valid JSON.')
  }

  if (typeof data !== 'object') {
    throw new Error('Invalid config file, make sure to use a valid JSON.')
  }

  if (typeof data.path !== 'string') {
    throw new Error('"path" must be a string.')
  }

  if (typeof data.file !== 'string') {
    throw new Error('"file" must be a string.')
  }

  if (data.port && typeof data.port !== 'number') {
    throw new Error('"port" must be a number.')
  }

  return {
    path: data.path,
    file: data.file,
    port: data.port || 3000,
  }
}

async function run() {
  const app = express()
  const logger = new Logger('Bootstrap')

  const { port, path, file } = await mustAsync(
    () => {
      return fs
        .readFile(join(process.cwd(), '.xlambdarc.json'), 'utf-8')
        .then((config) => validateConfig(config))
    },
    (err) => {
      logger.error(
        'Could not parse config file, make sure configure a ".xlambdarc.json" file in the root of your project.',
      )
      logger.error(err.message)
    },
  )

  logger.log(`Initializing server`)
  logger.log(`Mapped route: ${path}`)

  const handler = must(
    () => {
      return require(join(process.cwd(), file))
        .handler as APIGatewayProxyHandler
    },
    (err) => {
      logger.error(
        'Failed to load specified handler, make sure it is a valid path.',
      )
      logger.error('Reason:', err.message)
    },
  )

  app.use(path, (req, res) => {
    const logger = new Logger('Handler')
    const start = Date.now()

    res.on('finish', () => {
      const time = Date.now() - start

      const msg = `${req.method} ${req.originalUrl} ${time}ms - ${req.headers['user-agent']} ${req.ip}`

      if (res.statusCode >= 400) {
        logger.error(msg)
      } else {
        logger.log(msg)
      }
    })

    const headers = Object.entries(req.headers)
      .filter(([_, value]) => !Array.isArray(value))
      .reduce(
        (headers, [key, value]) => ({ ...headers, [key]: value as any }),
        {} as Record<string, string | undefined>,
      )

    const multiValueHeaders = Object.entries(req.headers)
      .filter(([_, value]) => Array.isArray(value))
      .reduce(
        (headers, [key, value]) => ({ ...headers, [key]: value as any }),
        {} as Record<string, string[] | undefined>,
      )

    const output = handler(
      {
        body: (req.body as string) ?? null,
        headers: headers,
        httpMethod: req.method,
        isBase64Encoded: false,
        path: req.path,
        pathParameters: req.params,
        queryStringParameters: req.query as Record<string, string>,
        multiValueHeaders: multiValueHeaders,
        multiValueQueryStringParameters: null,
        requestContext: null as any,
        resource: null as any,
        stageVariables: null as any,
      },
      {
        awsRequestId: '0e22683c-3fd2-4423-8922-b8d378ca24cb',
        callbackWaitsForEmptyEventLoop: true,
        functionName: 'handler',
        functionVersion: '1.0',
        invokedFunctionArn:
          'arn:aws:lambda:us-east-1:123456789012:function:custom-runtime',
        memoryLimitInMB: '128MB',
        getRemainingTimeInMillis: () => Infinity,
        logGroupName: 'none',
        logStreamName: 'none',
        done: (error?: Error, result?: any) => {
          if (error) {
            throw error
          }

          if (result) {
            res.status(result.statusCode)

            if (result.headers) {
              Object.entries(result.headers).forEach(([key, value]) => {
                res.setHeader(key, String(value))
              })
            }

            res.send(result.body)
          }
        },
        fail: (error: Error | string) => {
          return res.status(500).json({
            error: error instanceof Error ? error.message : error,
          })
        },
        succeed: (...args: any) => {
          throw new Error('Unimplemented')
        },
      },
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err instanceof Error ? err.message : err,
          })
        }

        if (result) {
          res.status(result.statusCode)

          if (result.headers) {
            Object.entries(result.headers).forEach(([key, value]) => {
              res.setHeader(key, String(value))
            })
          }

          res.send(result.body)
        }

        res.end()
      },
    )

    if (output instanceof Promise) {
      return output
        .then((result) => {
          res.status(result.statusCode)

          if (result.headers) {
            Object.entries(result.headers).forEach(([key, value]) => {
              res.setHeader(key, String(value))
            })
          }

          res.send(result.body)
        })
        .catch((err) => {
          return res.status(500).json({
            error: err instanceof Error ? err.message : err,
          })
        })
    }

    return res.end()
  })

  app.listen(port, () => {
    logger.log(`Server has initialized successfully`)
    logger.log(`Listening on address: http://localhost:${port}`)
  })
}

run()

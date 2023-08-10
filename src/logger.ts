import { colors } from './utils/colors'

export class Logger {
  constructor(private readonly prefix = 'Logger') {}

  _log(level: 'INFO' | 'WARN' | 'ERROR', ...args: any) {
    let color = colors.green

    switch (level) {
      case 'WARN':
        color = colors.yellow
        break
      case 'ERROR':
        color = colors.red
        break
    }

    const date = new Date().toLocaleString()

    console.log(
      color(`[Lambda] ${process.pid}  -`),
      colors.reset(date),
      colors.yellow(`  [${this.prefix}]`),
      ...args,
    )
  }

  log(...args: any) {
    this._log('INFO', ...args)
  }

  warn(...args: any) {
    this._log('WARN', ...args)
  }

  error(...args: any) {
    this._log('ERROR', ...args)
  }
}

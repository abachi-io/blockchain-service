const { createLogger, format, transports } = require('winston');
const packageJson = require('../package.json');

const { combine, timestamp, label, printf, colorize } = format;

const defaultFormat = printf(({ level, message, label, timestamp }) => {
  return `[${label}]  <  ${level} >  ${timestamp} |  ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: packageJson.name }),
    timestamp(),
    defaultFormat,
    colorize(),
    //prettyPrint(),
  ),
  transports: [
    /* {
      error: 0,
      warn: 1,
      info: 2,
      verbose: 3,
      debug: 4,
      silly: 5
    } */
    new transports.Console({ level: 'debug' }), // warnings and errors
    new transports.File({
      filename: `${packageJson.name}_combined.log`,
      level: 'debug'
    }),
    new transports.File({
      filename: `${packageJson.name}_error.log`,
      level: 'error'
    })
  ],
});


logger.add(new transports.Console({
  format: format.simple(),
  level: 'error'
}));

module.exports = logger;

const { createLogger, format, transports } = require('winston');
const moment = require('moment')
const packageJson = require('../../package.json');

const { combine, timestamp, label, printf, colorize } = format;

String.prototype.paddingLeft = function (paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};

const defaultFormat = printf(({ level, message, label, timestamp }) => {
  return `[${label}] < ${level.paddingLeft("     ")} > | ${moment(timestamp).format('DD/MM/YY | HH:mm:ss A')} |  ${message}`;
});

const logger = createLogger({
  format: combine(
    format.simple(),
    label({ label: packageJson.name }),
    timestamp(),
    defaultFormat,
    colorize(),
  ),
  transports: [
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

// logger.add(new transports.Console({
//   format: format.simple(),
//   level: 'error'
// }));

module.exports = logger;

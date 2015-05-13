var winston = require('winston')

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      colorize: 'true'
    })
  ]
})

module.exports = logger

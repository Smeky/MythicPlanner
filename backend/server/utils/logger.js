import winston from 'winston'
import winstonRotate from 'winston-daily-rotate-file'

const { combine, timestamp, printf } = winston.format

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ]
})

export default logger

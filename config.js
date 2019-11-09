const mongodbUrl = 'mongodb://localhost:27017/seckill-db'

module.exports = {
  KAFKA_HOST: 'localhost:9092',
  MONGODB_URL: mongodbUrl,
  REDIS: {
    PORT: 6379,
    URL: '127.0.0.1',
    PASSWORD: 'bztone-chinaunicom'
  }
}
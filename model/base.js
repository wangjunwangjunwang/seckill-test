const config = require('../config')
const mongoose = require('mongoose')

const options = {
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 10 * 1000,
  autoReconnect: true,
  connectTimeoutMS: 10 * 1000,
  socketTimeoutMS: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect(config.MONGODB_URL, options)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'mongodb connection error:'))
db.on('connected', () => console.log('mongodb connected'))
db.on('disconnected', ()=> console.log('mongodb disconnected'))
db.on('close', ()=> console.log('mongodb close'))
db.on('open', () => {
  console.log('mongodb open')
})

module.exports = mongoose

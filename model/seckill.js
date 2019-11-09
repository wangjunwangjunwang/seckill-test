const mongoose = require('./base')
const Schema = mongoose.Schema

const schema = new Schema({
  uid: { type: String }, // 用户uid
  seckillTime: { type: Date }, // 秒杀时间
  count: { type: Number} // 计数
}, {
  timestamps: true
})

const seckill = mongoose.model('Seckill', schema)

module.exports = seckill
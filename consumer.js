const kafka = require('kafka-node')
const config = require('./config')
const Consumer = kafka.Consumer
const client = new kafka.KafkaClient({ 
  kafkaHost: config.KAFKA_HOST
})
const consumer = new Consumer(
  client,
  [{
    topic: 'PROUDCT_NUMBER',
    partition: 0
  }], {
    autoCommit: true
  }
)
const Seckill = require('./model/seckill')

consumer.on('message', function (message) {
  console.log(`得到的生产者的数据为 : ${JSON.stringify(message)}`)
  let value = JSON.parse(message.value)

  // 插入数据
  let seckill = new Seckill({
    uid: value.uid,
    seckillTime: value.seckillTime,
    count: value.count
  })

  seckill.save((error) => {
    if (error) console.error(error)
    else console.log('插入数据库成功')
  })
})
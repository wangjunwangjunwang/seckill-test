const express = require('express')
const app = express()
const config = require('./config')
const redis = require('redis')
const kafka = require('kafka-node')
const Producer = kafka.Producer
const kafkaClient = new kafka.KafkaClient({
  kafkaHost: config.KAFKA_HOST
});
const producer = new Producer(kafkaClient, {
  requireAcks: 1,
  ackTimeoutMs: 100,
  partitionerType: 0 //默认为第一个分区
})
const bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4')

let count = 0

app.use(express.json())
app.use(bodyParser.json({
  limit: '1mb'
})) 
//body-parser 解析json格式数据
//此项必须在 bodyParser.json 下面,为参数编码
app.use(bodyParser.urlencoded({ 
  extended: true
}))

app.post('/seckill', function (req, res) {
  console.log(`count: ${count++}`)
  let fn = function (optionalClient) {
    let client = null
    if (!optionalClient) {
      client = redis.createClient(config.REDIS.PORT,config.REDIS.CONNECT_URL,{})
      client.auth(config.REDIS.PASSWORD, function (err, reply) {
        if (err) console.error('redis start error : %s',err)
      })
    } else {
      client = optionalClient
    }

    client.on('error', function (er) {
      console.error(er.stack)
      client.end(true)
    })

    client.watch('counter') //监听counter字段
    client.get('counter', function (err, reply) {
      if (parseInt(reply) > 0) {
        let multi = client.multi()
        multi.decr('counter') //更新redis的counter数量减一。
        multi.exec(function (err, replies) {
          console.log(`剩余数量 : ${replies}`)
          if (!replies) { //counter字段正在操作中，等待counter被其他释放
            console.log('counter被占用')
            fn(client)
          } else {
            let args = {
              uid: getUid(),
              seckillTime: new Date().getTime(),
              count
            }
            let payload = [{
              topic: 'PROUDCT_NUMBER',
              messages: [JSON.stringify(args)],
              key: 'seckill',
              partition: 0
            }]
            console.log(`payload : ${JSON.stringify(payload)}`)

            producer.send(payload, function (error, data) {
              if (error) {
                console.log(`send message error : ${error}`)
              } else {
                console.log(`send message complete , data: ${JSON.stringify(data)}`)
              }
            })
            producer.on('error', function (error) {
              console.log(`send message error : ${error}`)
            })


            res.send(replies)
            client.end(true)
          }
        })

      } else {
        console.log('已经卖光了')
        res.send('已经卖光了')
        client.end(true)
      }
    })
  }
  fn(null)
})

// 随机生成UID
var getUid = () => {
  return uuidv4().replace(/-/g,'')
}

app.listen(8888, '0.0.0.0', function () {
  console.log(`service started`)
})
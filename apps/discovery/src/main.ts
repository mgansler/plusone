import { connect } from 'amqplib/callback_api'

connect('amqp://localhost', (connectErr, connection) => {
  if (connectErr) {
    throw connectErr
  }

  connection.createChannel((channelErr, channel) => {
    if (channelErr) {
      throw channelErr
    }

    const queue = 'discover'

    channel.assertQueue(queue, { durable: false })

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue)

    channel.consume(
      queue,
      (msg) => {
        console.log(' [x] Received %s', msg.content.toString())
      },
      { noAck: true },
    )
  })
})

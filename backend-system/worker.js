
const amqp = require('amqplib');

// RabbitMQ connection
const rabbitUrl = 'amqp://localhost';
let channel;

async function connectToRabbit() {
  const connection = await amqp.connect(rabbitUrl);
  channel = await connection.createChannel();
  await channel.assertQueue('requests', { durable: true });
}

connectToRabbit();

// Process requests
async function processRequests() {
  channel.consume('requests', (msg) => {
    if (msg!== null) {
      const request = JSON.parse(msg.content.toString());
      console.log(`Processing request ${request.id}`);
      // Process the request
      //...
      channel.ack(msg);
    }
  });
}

processRequests();


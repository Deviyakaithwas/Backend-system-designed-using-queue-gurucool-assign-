
const express = require('express');
const app = express();
const amqp = require('amqplib');
const { Pool } = require('pg');

// Database connection
const dbPool = new Pool({
  user: 'username',
  host: 'localhost',
  database: 'database',
  password: 'password',
  port: 5432,
});

// RabbitMQ connection
const rabbitUrl = 'amqp://localhost';
let channel;

async function connectToRabbit() {
  const connection = await amqp.connect(rabbitUrl);
  channel = await connection.createChannel();
  await channel.assertQueue('requests', { durable: true });
}

connectToRabbit();

// Authentication middleware
app.use(async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  const user = await authenticateUser(token);
  if (!user) {
    return res.status(401).send('Unauthorized');
  }
  req.user = user;
  next();
});

// Enqueue request
app.post('/requests', async (req, res) => {
  const { user } = req;
  const request = {...req.body, userId: user.id };
  channel.sendToQueue('requests', Buffer.from(JSON.stringify(request)));
  res.send('Request enqueued');
});

// Worker process
async function processRequests() {
  channel.consume('requests', (msg) => {
    if (msg!== null) {
      const request = JSON.parse(msg.content.toString());
      console.log(`Processing request ${request.id}`);
      // Process the request
      dbPool.query(`INSERT INTO requests (id, user_id, data) VALUES ($1, $2, $3)`, [request.id, request.userId, request.data]);
      channel.ack(msg);
    }
  });
}

processRequests();
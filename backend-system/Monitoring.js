const { CollectorRegistry, register } = require('prom-client');

const registry = new CollectorRegistry();

// Collect metrics
registry.register({
  name: 'quests_processed',
  help: 'Number of requests processed',
  type: 'counter',
});

registry.register({
  name: 'quests_queued',
  help: 'Number of requests queued',
  type: 'gauge',
});

//...

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
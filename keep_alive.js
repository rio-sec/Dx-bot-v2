const http = require('http');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('DEATH-X BOT is alive!');
});

app.listen(3000, () => {
  console.log('Keep-alive server running on port 3000');
});


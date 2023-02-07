var proxy = require('express-http-proxy');
const express = require('express');
const http = require('http');
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

server.listen(3002, () => {
  console.log("Server running on port 3002");
});


app.post('/register', proxy('http://localhost:3001/register'));
app.post('/login', proxy('http://localhost:3001/login'));

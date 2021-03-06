'use strict';

// 3rd Party Resources
const express = require('express');
const users = require('./users.js');
const morgan = require('morgan');
const cors = require('cors');
const basicAuth = require('./basic-auth-middleware.js');
const bearerAuth = require('./bearer-auth-middleware.js');
const acl = require('./acl-middleware.js');
const oauth = require('./oauth-middleware.js');
const PORT = process.env.PORT || 3030;

// Prepare the express app
const app = express();

// App Level MW
app.use(express.static('./public'));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// echo '{"username":"john","password":"foo"}' | http post :3000/signup
app.post('/signup', (req, res) => {
  users.save(req.body)
    .then(user => {
      let token = users.generateToken(user);
      res.status(200).send(token);
    })
    .catch(e => { res.status(403).send("Error Creating User"); });
});

// http post :3000/signin -a john:foo
app.post('/signin', basicAuth, (req, res) => {
  res.status(200).send(req.token);
});

app.get('/oauth', oauth, (req, res) => {
  res.status(200).send(req.token);
});

app.get('/allusers', bearerAuth, (req, res) => {
  res.status(200).send('OK!');
});

app.get('/create', bearerAuth, acl("create"), (req, res) => {
  res.status(200).send('OK!');
});

app.get('/update', bearerAuth, acl("update"), (req, res) => {
  res.status(200).send('OK!');
})

app.get('/delete', bearerAuth, acl("delete"), (req, res) => {
  res.status(200).send('OK!');
})

users.save({ username: 'jacob', password: 'test', role: 'admin' }).then(user => console.log('User created', user));

app.listen(PORT, () => console.log(`server up :: ${PORT}`));


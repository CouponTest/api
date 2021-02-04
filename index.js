const Express = require('express');
const server = Express();
const chalk = require("chalk");
const bodyParser = require("body-parser");
const logger = require("morgan");


const router = require('./routes/router')


server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use('/', router);
server.use(logger('common'));
server.set('view engine', 'ejs');


Promise.resolve(server.listen(4200)).then(async () => {
  const _message = chalk.green.bold("[OK]");
  await console.log(`Server running... ${_message}`);
});

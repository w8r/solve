const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const listEndpoints = require('express-list-endpoints');
const chalk = require('chalk');
const http = require('http');
const https = require('https');
const fs = require('fs');

require('./db');
const passport = require('./db/passport');

const displayAllEndpoints = (app) => {
  const endpoints = listEndpoints(app);
  let total = 0;
  console.log(chalk.cyanBright(`\n[*] API Endpoints:`));
  endpoints.forEach(({ path, methods, middleware }) => {
    methods.forEach((method) => {
      total += 1;
      console.log(chalk.gray(`[+] ${method.padEnd(6)}`), chalk.green(path));
    });
  });
  console.log(chalk.cyanBright(`[*] Total: ${total} endpoints`));
};

const config = require('./config/development');

//console.log(config);

const app = express();
//app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('./routes'));

app.use(passport.initialize());
console.log(
  path.resolve(
    process.cwd(),
    '../client/.expo/web/development/ssl/key-localhost.pem'
  )
);

const httpServer = http.createServer(app);
if (process.env.NODE_ENV === 'development') {
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync(
        path.resolve(
          process.cwd(),
          '../client/.expo/web/development/ssl/key-localhost.pem'
        ),
        'utf8'
      ),
      cert: fs.readFileSync(
        path.resolve(
          process.cwd(),
          '../client/.expo/web/development/ssl/cert-localhost.pem'
        ),
        'utf8'
      )
    },
    app
  );

  httpsServer.listen(config.httpsPort, () => {
    console.log(
      chalk.cyanBright(`[*] Server listening on port ${config.httpsPort}`)
    );
  });
}

httpServer.listen(config.httpPort, () => {
  displayAllEndpoints(app);
  console.log(
    chalk.cyanBright(`[*] Server listening on port ${config.httpPort}`)
  );
});

// error handler
// no stracktrace sent to client
app.use((err, req, res, next) => {
  res
    .status(err.status || 400)
    .json({ error: { message: err.message, code: err.code } });
});

global.app = app;

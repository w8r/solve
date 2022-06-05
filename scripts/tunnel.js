const localtunnel = require('localtunnel');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const ngrok = require('ngrok');

require('dotenv').config({
  path: `${__dirname}/../.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`
});

(async () => {
  let tunnel;

  console.log(chalk.cyanBright('[*] Starting localtunnel...'));

  const intervalHandle = setInterval(() => {
    console.log(chalk.green('[*] Tunnel heartbeat.'));
  }, 60000);

  const confPath = path.join(
    process.cwd(),
    'packages',
    'client',
    'src',
    'constants',
    'env.json'
  );
  const conf = JSON.parse(fs.readFileSync(confPath, 'utf8'));

  function exitHandler(options, exitCode) {
    if (exitCode || exitCode === 0) {
      console.log(chalk.red('[*] Exiting with code:', exitCode));
    }
    if (options.exit) {
      process.exit(0);
    }
    if (options.cleanup) {
      if (tunnel) {
        console.log(
          chalk.yellow('[*] Tunnel: '),
          chalk.gray('Closing tunnel.')
        );
        ngrok.kill();
        //tunnel.close();
      }
      clearInterval(intervalHandle);
      console.log(chalk.green('[*] Cleaning up...'));
    }
  }

  //do something when app is closing
  process
    .on('exit', () => exitHandler({ cleanup: true }, 0))

    //catches ctrl+c event
    .on('SIGINT', () => exitHandler({ exit: true }))

    // catches "kill pid" (for example: nodemon restart)
    .on('SIGUSR1', () => exitHandler({ exit: true }))
    .on('SIGUSR2', () => exitHandler({ exit: true }))

    //catches uncaught exceptions
    .on('uncaughtException', (e) => {
      console.log(chalk.red('Uncaught Exception...'), e);
      exitHandler({ exit: true });
    });

  try {
    tunnel = await ngrok.connect({
      authtoken: process.env.NGROK_TOKEN,
      addr: process.env.PORT,
      onStatusChange: (status) => {
        if (status === 'closed') {
          console.log(chalk.red('[*] Tunnel: '), chalk.gray('Closed.'));
        }
        if (status === 'connected') {
          console.log(chalk.red('[*] Tunnel: '), chalk.gray('Connected'));
        }
      }
    });
    console.log({ tunnel });
  } catch (err) {
    console.log(chalk.redBright('[*] Tunnel connection failed:', err));
  }

  conf.tunnel = tunnel;
  fs.writeFileSync(confPath, JSON.stringify(conf, null, 2));

  console.log(
    chalk.yellow('[*] Tunnel: '),
    chalk.gray(process.env.SERVER_PUBLIC_URL),
    '=>',
    chalk.cyan(tunnel)
  );

  process.env.API_URL = tunnel;
})();

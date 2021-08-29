const localtunnel = require('localtunnel');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

require('dotenv').config({
  path: `${__dirname}/../.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`
});

(async () => {
  const tunnel = await localtunnel({ port: process.env.PORT });

  // the assigned public url for your tunnel
  // i.e. https://abcdefgjhij.localtunnel.me
  console.log(
    chalk.yellow(' - Tunnel: '),
    chalk.gray(process.env.SERVER_PUBLIC_URL),
    '=>',
    chalk.cyan(tunnel.url)
  );

  process.env.API_URL = tunnel.url;

  const confPath = path.join(
    process.cwd(),
    'packages',
    'client',
    'src',
    'constants',
    'env.json'
  );
  const conf = JSON.parse(fs.readFileSync(confPath, 'utf8'));
  conf.tunnel = tunnel.url;
  console.log(conf);
  fs.writeFileSync(confPath, JSON.stringify(conf, null, 2));

  process.on('exit', () => tunnel.close());
  tunnel.on('close', () => {
    conf.tunnel = null;
    fs.writeFileSync(confPath, JSON.stringify(conf, null, 2));
    console.log(chalk.orange('Tunnel closed'));
  });
})();

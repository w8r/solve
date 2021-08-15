require('dotenv').config({
  path: `${__dirname}/../../../.env`
});

console.log(process.env);

module.exports = {
  env: process.env.NODE_ENV,
  port: 3001,
  //DB_URI: 'mongodb://localhost:27017/solve-dev',
  DB_URI: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    name: 'solve',
    headerName: 'x-auth-token',
    tokenLifeTime: 60 * 60 * 24 * 365
  },
  auth: {
    googleId: process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
    facebookId: process.env.FACEBOOK_APP_ID,
    facebookSecret: process.env.FACEBOOK_APP_SECRET
  }
};

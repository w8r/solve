require('dotenv').config({
  path: `${__dirname}/../../../.env${
    process.env.NODE_ENV === 'test' ? '.test' : ''
  }`
});

const isDev = process.env.NODE_ENV === 'development';

// console.log(process.env);

const isNotTest = process.env.NODE_ENV !== 'test';

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  //DB_URI: 'mongodb://localhost:27017/solve-dev',
  DB_URI: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    name: 'solve',
    headerName: 'Authorization',
    algorithm: 'HS512',
    expiresIn: 60 * 24 * 60 * 60 // seconds
  },
  rateLimit: {
    enabled: isNotTest
  },
  auth: {
    googleId: process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
    facebookId: process.env.FACEBOOK_APP_ID,
    facebookSecret: process.env.FACEBOOK_APP_SECRET
  },
  debug: isNotTest
};

const mongoose = require('mongoose');
const config = require('../config/development');

require('../models');

mongoose.Promise = global.Promise; // instead of bluebird, I guess

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose
  .connect(config.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log(' - db connected'))
  .catch(() => console.error('Failed to connect to db'));

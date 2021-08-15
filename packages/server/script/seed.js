const mongoose = require('mongoose');
const chalk = require('chalk');
const config = require('../config/development');

/**
 * @function createUsers
 * Seed the given list of users
 *
 * @param {string} users The array of user info to be created
 * @returns {Promise} Resolve with a list of newly added users
 */
module.exports.createUsers = (users) => {
  const Users = mongoose.model('Users');
  const addedUsers = [];

  return users
    .reduce((sequence, userInfo) => {
      return sequence
        .then(() => {
          return Users.findOne({
            $or: [{ name: userInfo.username }, { email: userInfo.email }]
          });
        })
        .then((existingUser) => {
          if (existingUser) {
            throw new Error(
              chalk.yellow(
                `[-] [Warning] Database seeding: Email (${userInfo.email}) or username (${userInfo.name}) already in use.`
              )
            );
          }
          const user = new Users(userInfo);
          user.provider.local = {
            userId: user._id
          };
          return user
            .setPasswordAsync(userInfo.password)
            .then(() => user.save());
        })
        .then((user) => {
          console.log(
            chalk.green(
              `[+] Database Seeding: A new user added (${userInfo.name} - ${userInfo.email} - ${userInfo.password})`
            )
          );
          addedUsers.push(user);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }, Promise.resolve())
    .then(() => Promise.resolve(addedUsers));
};

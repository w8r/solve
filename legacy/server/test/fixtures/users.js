const constants = require('../../config/constants');

module.exports = [
  {
    name: 'root',
    email: 'root@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-01',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-01',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'anotherroot',
    email: 'another-root@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-01',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-01',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'admin',
    email: 'admin@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-02',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-02',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'anotheradmin',
    email: 'another-admin@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-02',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-02',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'specialuser',
    email: 'special-user@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-03',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'anotherspecialuser',
    email: 'another-special-user@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-03',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'user',
    email: 'tester.hmt4@gmail.com',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-03',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'anotheruser',
    email: 'another-user@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    provider: {
      google: {
        userId: 'google-user-id-03',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url'
      }
    }
  },
  {
    name: 'reset-password-user',
    email: 'reset-password-user@tdev.app',
    password: 'password',
    status: constants.STATUS_ACTIVE,
    token: 'reset-password-token',
    tokenPurpose: constants.TOKEN_PURPOSE_RESET_PASSWORD,
    tokenExpiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    provider: {
      google: {
        userId: 'google-user-id-03',
        picture: 'google-avatar-url'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url'
      }
    }
  }
];

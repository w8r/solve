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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-01',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-01',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-02',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-02',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
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
        picture: 'google-avatar-url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token'
      },
      facebook: {
        userId: 'facebook-user-id-03',
        picture: 'facebook-avatar-url',
        accessToken: 'facebook-access-token',
        refreshToken: 'facebook-refresh-token'
      }
    }
  }
];

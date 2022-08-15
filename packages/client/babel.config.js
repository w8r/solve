process.env.TAMAGUI_TARGET = 'native';

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['react-native-reanimated/plugin'],
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tests/lib/tamagui.config.js',
          importsWhitelist: ['constants.js', 'colors.js'],
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development'
        }
      ],
      [
        'transform-inline-environment-variables',
        {
          include: 'TAMAGUI_TARGET'
        }
      ],
      [
        'module:react-native-dotenv',
        {
          path: '../../.env'
        }
      ],
      ['@babel/plugin-proposal-export-namespace-from']
    ]
  };
};

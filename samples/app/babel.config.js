module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {
        unstable_transformProfile: 'hermes-stable',
      },
    ],
  ],
  plugins: [
    ['module-resolver', { root: ['.'], extensions: ['.tsx', '.ts'] }],
    'react-native-reanimated/plugin',
  ],
}

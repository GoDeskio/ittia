module.exports = {
  root: true,
  extends: [
    '@react-native',
    'eslint:recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  env: {
    'react-native/react-native': true,
    'browser': true,
    'node': true
  },
  plugins: [
    'react',
    'react-native'
  ],
  rules: {
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  }
}; 
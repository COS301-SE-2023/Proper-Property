const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
function getClientEnvironment() {
  // Grab NX_* environment variables and prepare them to be injected
  // into the application via DefinePlugin in webpack configuration.
  const NX_APP = /^NX_/i;

  const raw = Object.keys(process.env)
    .filter((key) => NX_APP.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {});

  // Stringify all values so we can feed into webpack DefinePlugin
  return {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };
}

module.exports = (config, options, context) => {
  // Overwrite the mode set by Angular if the NODE_ENV is set
  config.mode = process.env.NODE_ENV || config.mode;
  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: 'firebase-messaging-sw.js', 
          to: 'firebase-messaging-sw.js',
          force: true,
          transform(content, path) {
            // Prepend firebase config to service worker file, 
            // because GitGuardian is a stupid, paranoid robot
            const env = getClientEnvironment();
            const config = 
                `const firebaseConfig = {\n`
              + `  apiKey: ${env['process.env']['NX_FIREBASE_KEY']},\n`
              + `  authDomain: ${env['process.env']['NX_FIREBASE_AUTH_DOMAIN']},\n`
              + `  databaseURL: ${env['process.env']['NX_FIREBASE_DATABASE_URL']},\n`
              + `  projectId: ${env['process.env']['NX_FIREBASE_PROJECT_ID']},\n`
              + `  storageBucket: ${env['process.env']['NX_FIREBASE_STORAGE_BUCKET']},\n`
              + `  messagingSenderId: ${env['process.env']['NX_FIREBASE_MESSAGING_SENDER_ID']},\n`
              + `  appId: ${env['process.env']['NX_FIREBASE_APP_ID']},\n`
              + `  measurementId: ${env['process.env']['NX_FIREBASE_MEASUREMENT_ID']}\n`
              + `};\n`;
            return Buffer.from(config + content);
          }
        }
      ]
    })
  );
  config.plugins.push(new webpack.DefinePlugin(getClientEnvironment()));
  return config;
};

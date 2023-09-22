// const { composePlugins, withNx } = require('@nx/webpack');
// const webpack = require('webpack');
// // Nx plugins for webpack.
// function getClientEnvironment() {
//   // Grab NX_* environment variables and prepare them to be injected
//   // into the application via DefinePlugin in webpack configuration.
//   const NX_APP = /^NX_/i;

//   const raw = Object.keys(process.env)
//     .filter((key) => NX_APP.test(key))
//     .reduce((env, key) => {
//       env[key] = process.env[key];
//       return env;
//     }, {});

//   // Stringify all values so we can feed into webpack DefinePlugin
//   return {
//     'process.env': Object.keys(raw).reduce((env, key) => {
//       env[key] = JSON.stringify(raw[key]);
//       return env;
//     }, {}),
//   };
// }
// module.exports = composePlugins(withNx(), (config) => {
//   // Update the webpack config as needed here.
//   // e.g. `config.plugins.push(new MyPlugin())`
//   // console.log(process.env);
//   config.plugins.push(new webpack.DefinePlugin(getClientEnvironment()));

//   return config;
// });
const { composePlugins, withNx } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  return config;
});
import localConfig from "./local.config";
import developConfig from "./develop.config";
import productionConfig from "./production.config";

export const pjson = require('../../package.json')

const ENV = process.env.NODE_ENV

let envConfig: object

if (ENV === 'production') {
  envConfig = productionConfig()
} else if (ENV === 'development') {
  envConfig = developConfig()
} else {
  envConfig = localConfig()
}

export default () => ({
  name: pjson.name || '',
  version: pjson.version || '',
  ...envConfig,
});

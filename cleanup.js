const core = require('@actions/core')
const cache = require('@actions/cache')

const { paths, key }= require('./cache')

async function run() {
  try {
    await cache.saveCache(paths, key)
  } catch (error) {
    if (err.message.includes("Cache already exists")) {
      core.info(`Cache entry ${key} has already been created by another worfklow`);
    } else {
      throw err;
    }
  }
}

run()

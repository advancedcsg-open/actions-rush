const core = require('@actions/core')
const cache = require('@actions/cache')

const { paths, restoreKeys, key }= require('./cache')

async function run() {
  try {
    await cache.saveCache(paths, key)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

const core = require('@actions/core')
const cache = require('@actions/cache')

const { paths, key } = require('./cache')

async function run () {
  try {
    if (core.getState('storeState')) {
      await cache.saveCache(paths, key)
    }
  } catch (error) {
    if (error.message.includes('Cache already exists')) {
      core.info(`Cache entry ${key} has already been created by another worfklow`)
    } else {
      throw err
    }
  }
}

run()

const core = require('@actions/core')
const cache = require('@actions/cache')
const exec = require('@actions/exec')

const { paths, restoreKeys, key } = require('./cache')

async function run () {
  try {
    const cacheKey = await cache.restoreCache(paths, key, restoreKeys)

    // run rush install if no cacheKey returned or repo state has changed
    if (typeof cacheKey === 'undefined' || cacheKey !== key) {
      await exec.exec('node', ['common/scripts/install-run-rush.js', 'install'])
      core.saveState('storeCache', true)
    } else {
      core.saveState('storeCache', false)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

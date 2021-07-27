const core = require('@actions/core')
const cache = require('@actions/cache')
const exec = require('@actions/exec')
const getCache = require('./cache')

async function run () {
  try {
    const { paths, restoreKeys, key } = getCache(core.getInput('package-manager'))
    const cacheKey = await cache.restoreCache(paths, key, restoreKeys)
    core.saveState('cachePaths', paths)
    core.saveState('cacheKey', key)

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

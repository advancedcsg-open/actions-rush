const core = require('@actions/core')
const cache = require('@actions/cache')
const exec = require('@actions/exec')
const getCache = require('./cache')

async function run () {
  try {
    const { paths, restoreKeys, primaryKey } = getCache(core.getInput('package-manager'))
    const cacheKey = await cache.restoreCache(paths, primaryKey, restoreKeys)
    core.saveState('cachePaths', paths)
    core.saveState('cacheKey', primaryKey)

    // run rush install if no cacheKey returned or repo state has changed
    if (typeof cacheKey === 'undefined' || cacheKey !== primaryKey) {
      core.info('cache needs updating')
      await exec.exec('node', ['common/scripts/install-run-rush.js', 'install'])
      core.saveState('storeCache', true)
    } else {
      core.info('cache restored')
      core.saveState('storeCache', false)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

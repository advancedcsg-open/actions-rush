const cache = require('@actions/cache')
const core = require('@actions/core')
const path = require('path')

const { Events, State, CachePaths, RestoreKeys } = require('./constants')
const utils = require('./utils/actionUtils')

async function run() {
  try {
    if (utils.isGhes()) {
      utils.logWarning('RushJS Helper action is not supported on GHES')
      utils.setCacheHitOutput(false)
      return
    }

    if (!utils.isValidEvent()) {
      utils.logWarning(`Event Validation Error: The event type ${process.env[Events.Key]} is not supported because it's not tied to a branch or tag ref.`)
      return
    }

    const build = core.getInput('build', { required: false, default: false })
    const workingDirectory = core.getInput('working-directory', { required: false, default: '.' })
    const cachePaths = CachePaths.map(p => path.join(workingDirectory, p))

    const primaryKey = utils.generateCacheKey(core.getInput('package-manager'), workingDirectory)
    core.saveState(State.CachePrimaryKey, primaryKey)
    let cacheKey
    try {
      cacheKey = await cache.restoreCache(cachePaths, primaryKey, RestoreKeys)
      if (!cacheKey) {
        core.info(`Cache not found for key: ${[primaryKey, ...RestoreKeys].join(', ')}.`)
        core.info('Executing `rush install`...')
      }
      utils.setCacheState(cacheKey)
    } catch (error) {
      if (error.name === cache.ValidationError.name) {
        throw error
      } else {
        utils.logWarning(error.message)
      }
    }
    // always run rush install
    await utils.runRushInstall(workingDirectory)
    core.info(`Cache restored from key: ${cacheKey}`)

    // run rush build if specified
    if (build == "true") {
      core.info('Executing `rush build`...')
      await utils.runRushBuild(workingDirectory)
    }
  } catch (error) {
    console.log(error)
    core.setFailed(error.message)
  }
}

run()

module.exports = run

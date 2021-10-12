const cache = require('@actions/cache')
const core = require('@actions/core')

const { Events, State, CachePaths, RestoreKeys } = require('./constants')
const utils = require('./utils/actionUtils')

async function run () {
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

    const primaryKey = utils.generateCacheKey(core.getInput('package-manager'))
    core.saveState(State.CachePrimaryKey, primaryKey)

    try {
      const cacheKey = await cache.restoreCache(CachePaths, primaryKey, RestoreKeys)
      if (!cacheKey) {
        core.info(`Cache not found for key: ${[primaryKey, ...RestoreKeys].join(', ')}.`)
        core.info('Executing `rush install`...')
        await utils.runRushInstall()
        return
      }

      utils.setCacheState(cacheKey)

      const isExactKeyMatch = utils.isExactKeyMatch(primaryKey, cacheKey)
      if (!isExactKeyMatch) await utils.runRushInstall()

      core.info(`Cache restored from key: ${cacheKey}`)
    } catch (error) {
      if (error.name === cache.ValidationError.name) {
        throw error
      } else {
        utils.logWarning(error.message)
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

module.exports = run

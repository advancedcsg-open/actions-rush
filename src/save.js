const core = require('@actions/core')
const cache = require('@actions/cache')
const path = require('path')

const { Events, State, CachePaths } = require('./constants')
const utils = require('./utils/actionUtils')

async function run () {
  core.info(`Caching rush temp files in ${CachePaths.join(', ')}`)
  try {
    if (utils.isGhes()) {
      utils.logWarning('This action is not supported on GHES')
      return
    }

    if (!utils.isValidEvent()) {
      utils.logWarning(`Event Validation Error: The event type ${process.env[Events.Key]} is not supported because it's not tied to a branch or tag ref.`)
      return
    }

    const state = utils.getCacheState()
    const workingDirectory = core.getInput('working-directory')
    const cachePaths = CachePaths.map(p => path.join(workingDirectory, p))

    const primaryKey = core.getState(State.CachePrimaryKey)
    if (!primaryKey) {
      utils.logWarning('Error retrieving key from state.')
      return
    }

    if (utils.isExactKeyMatch(primaryKey, state)) {
      core.info(`Cache hit occurred on the primary key ${primaryKey}, not saving cache.`)
      return
    }

    try {
      await cache.saveCache(cachePaths, primaryKey)
      core.info(`Cache saved with key: ${primaryKey}`)
    } catch (error) {
      if (error.name === cache.ValidationError.name) {
        throw error
      } else if (error.name === cache.ReserveCacheError.name) {
        core.info(error.message)
      } else {
        utils.logWarning(error.message)
      }
    }
  } catch (error) {
    utils.logWarning(error.message)
  }
}

run()

module.exports = run

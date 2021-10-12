const core = require('@actions/core')
const exec = require('@actions/exec')
const hasha = require('hasha')

const { State, RefKey, KeyPrefix } = require('../constants')

function isGhes () {
  const ghUrl = new URL(process.env.GITHUB_SERVER_URL || 'https://github.com')
  return ghUrl.hostname.toUpperCase() !== 'GITHUB.COM'
}

function isExactKeyMatch (key, cacheKey) {
  return !!(
    cacheKey &&
    cacheKey.localeCompare(key, undefined, {
      sensitivity: 'accent'
    }) === 0
  )
}

function setCacheState (state) {
  core.saveState(State.CacheMatchedKey, state)
}

function getCacheState () {
  const cacheKey = core.getState(State.CacheMatchedKey)
  if (cacheKey) {
    core.debug(`Cache state/key: ${cacheKey}`)
    return cacheKey
  }

  return undefined
}

function logWarning (message) {
  const warningPrefix = '[warning]'
  core.info(`${warningPrefix}${message}`)
}

function isValidEvent () {
  return RefKey in process.env && Boolean(process.env[RefKey])
}

async function runRushInstall () {
  return exec.exec('node', ['common/scripts/install-run-rush.js', 'install'])
}

function generateCacheKey (packageManager) {
  function getLockFile (packageManager) {
    const packageManagers = {
      npm: 'common/config/rush/npm-shrinkwrap.json',
      pnpm: 'common/config/rush/pnpm-lock.yaml',
      yarn: 'common/config/rush/yarn.lock'
    }

    const lockfile = packageManagers[packageManager]
    core.info(`lockfile is ${lockfile}`)
    if (!lockfile) throw new Error('Invalid package manager supplied. Valid values are `pnpm`, `npm` or `yarn`')
    return lockfile
  }

  const lockfile = getLockFile(packageManager)
  const lockfileHash = hasha.fromFileSync(lockfile, { algorithm: 'md5' })
  return `${KeyPrefix}${process.platform}-${lockfileHash}`
}

module.exports = {
  isGhes,
  isExactKeyMatch,
  setCacheState,
  getCacheState,
  logWarning,
  isValidEvent,
  runRushInstall,
  generateCacheKey
}

const core = require('@actions/core')
const path = require('path')
const hasha = require('hasha')

function getLockfile (packageManager) {
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

module.exports = (packageManager) => {
  const repoState = hasha.fromFileSync(path.join(__dirname, getLockfile(packageManager)), { algorithm: 'md5' })
  core.info(`file hash is ${repoState}`)

  return {
    paths: ['common/temp'],
    restoreKeys: ['rush-temp-'],
    primaryKey: `rush-temp-${repoState}`
  }
}

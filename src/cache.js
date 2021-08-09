const hasha = require('hasha')

function getLockfile (packageManager) {
  const packageManagers = {
    npm: 'common/config/rush/npm-shrinkwrap.json',
    pnpm: 'common/config/rush/pnpm-lock.yaml',
    yarn: 'common/config/rush/yarn.lock'
  }

  const lockfile = packageManagers[packageManager]
  if (!lockfile) throw new Error('Invalid package manager supplied. Valid values are `pnpm`, `npm` or `yarn`')
  return lockfile
}

module.exports = (packageManager) => {
  const repoState = hasha.fromFileSync(getLockfile(packageManager), { algorithm: 'md5' })

  return {
    paths: ['common/temp'],
    restoreKeys: ['rush-temp-'],
    key: `rush-temp-${repoState}`
  }
}

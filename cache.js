const hasha = require('hasha')
const repoState = hasha.fromFileSync('common/config/rush/repo-state.json', { algorithm: 'md5' })

module.exports = {
  paths: ['common/temp'],
  restoreKeys: ['rush-temp-'],
  key: `rush-temp-${repoState}`
}

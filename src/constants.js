const State = {
  CachePrimaryKey: 'RUSHJS_HELPER_KEY',
  CacheMatchedKey: 'RUSHJS_HELPER_RESULT'
}

const Events = {
  Key: 'GITHUB_EVENT_NAME',
  Push: 'push',
  PullRequest: 'pull_request'
}

const RefKey = 'GITHUB_REF'

const CachePaths = ['common/temp']

const KeyPrefix = 'rushjs-helper-'
const RestoreKeys = [
  `${KeyPrefix}${process.platform}-`,
  KeyPrefix
]

module.exports = {
  State,
  Events,
  RefKey,
  CachePaths,
  KeyPrefix,
  RestoreKeys
}

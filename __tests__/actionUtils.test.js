/* eslint-env jest */
const core = require('@actions/core')

const { Events, RefKey, State, KeyPrefix } = require('../src/constants')
const actionUtils = require('../src/utils/actionUtils')

jest.mock('@actions/core')

beforeAll(() => {
  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    return jest.requireActual('@actions/core').getInput(name, options)
  })
})

afterEach(() => {
  delete process.env[Events.Key]
  delete process.env[RefKey]
})

test('isGhes returns true if server url is not github.com', () => {
  try {
    process.env.GITHUB_SERVER_URL = 'http://example.com'
    expect(actionUtils.isGhes()).toBe(true)
  } finally {
    process.env.GITHUB_SERVER_URL = undefined
  }
})

test('isExactKeyMatch with undefined cache key returns false', () => {
  const key = 'rushjs-helper-test-key'
  const cacheKey = undefined

  expect(actionUtils.isExactKeyMatch(key, cacheKey)).toBe(false)
})

test('isExactKeyMatch with empty cache key returns false', () => {
  const key = 'rushjs-helper-test-key'
  const cacheKey = ''

  expect(actionUtils.isExactKeyMatch(key, cacheKey)).toBe(false)
})

test('isExactKeyMatch with different keys returns false', () => {
  const key = 'rushjs-helper-test-key'
  const cacheKey = 'rushjs-helper-mismatched-key'

  expect(actionUtils.isExactKeyMatch(key, cacheKey)).toBe(false)
})

test('isExactKeyMatch with same key returns true', () => {
  const key = 'rushjs-helper-test-key'
  const cacheKey = 'rushjs-helper-test-key'

  expect(actionUtils.isExactKeyMatch(key, cacheKey)).toBe(true)
})

test('isExactKeyMatch with same key and different casings returns true', () => {
  const key = 'rushjs-helper-test-key'
  const cacheKey = 'RUSHJS-HELPER-TEST-KEY'

  expect(actionUtils.isExactKeyMatch(key, cacheKey)).toBe(true)
})

test('getCacheState with no state returns undefined', () => {
  const getStateMock = jest.spyOn(core, 'getState')
  getStateMock.mockImplementation(() => {
    return ''
  })

  const state = actionUtils.getCacheState()

  expect(state).toBe(undefined)

  expect(getStateMock).toHaveBeenCalledWith(State.CacheMatchedKey)
  expect(getStateMock).toHaveBeenCalledTimes(1)
})

test('getCacheState with valid state', () => {
  const cacheKey = 'rushjs-helper-bb828da54c148048dd17899ba9fda624811cfb43'

  const getStateMock = jest.spyOn(core, 'getState')
  getStateMock.mockImplementation(() => {
    return cacheKey
  })

  const state = actionUtils.getCacheState()

  expect(state).toEqual(cacheKey)

  expect(getStateMock).toHaveBeenCalledWith(State.CacheMatchedKey)
  expect(getStateMock).toHaveBeenCalledTimes(1)
})

test('logWarning logs a message with a warning prefix', () => {
  const message = 'A warning occurred.'

  const infoMock = jest.spyOn(core, 'info')

  actionUtils.logWarning(message)

  expect(infoMock).toHaveBeenCalledWith(`[warning]${message}`)
})

test('isValidEvent returns false for event that does not have a branch or tag', () => {
  const event = 'foo'
  process.env[Events.Key] = event

  const isValidEvent = actionUtils.isValidEvent()

  expect(isValidEvent).toBe(false)
})

test('isValidEvent returns true for event that has a ref', () => {
  const event = Events.Push
  process.env[Events.Key] = event
  process.env[RefKey] = 'ref/heads/feature'

  const isValidEvent = actionUtils.isValidEvent()

  expect(isValidEvent).toBe(true)
})

test('rush runners complete successfully', () => {
  const runRushInstallMock = jest.spyOn(actionUtils, 'runRushInstall')
  const runRushBuildMock = jest.spyOn(actionUtils, 'runRushBuild')

  actionUtils.runRushInstall()
  actionUtils.runRushBuild()

  expect(runRushInstallMock).toHaveBeenCalledTimes(1)
  expect(runRushBuildMock).toHaveBeenCalledTimes(1)
})

test('get lock file for all valid types', () => {
  const cacheKey = new RegExp(`${KeyPrefix}${process.platform}-`)
  const generateCacheKeyNpm = actionUtils.generateCacheKey('npm')
  const generateCacheKeyYarn = actionUtils.generateCacheKey('yarn')
  const generateCacheKeyPnpm = actionUtils.generateCacheKey('pnpm')

  expect(generateCacheKeyNpm).toMatch(cacheKey)
  expect(generateCacheKeyYarn).toMatch(cacheKey)
  expect(generateCacheKeyPnpm).toMatch(cacheKey)
})

test('throw error in invalid lockfile type', () => {
  expect(() => {
    actionUtils.generateCacheKey('foo')
  }).toThrow('Invalid package manager supplied. Valid values are `pnpm`, `npm` or `yarn`')
})

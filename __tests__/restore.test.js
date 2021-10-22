/* eslint-env jest */
const cache = require('@actions/cache')
const core = require('@actions/core')

const { Events, RefKey, CachePaths, RestoreKeys } = require('../src/constants')
const run = require('../src/restore')
const actionUtils = require('../src/utils/actionUtils')

jest.mock('@actions/core')
jest.mock('../src/utils/actionUtils')

beforeAll(() => {
  jest.spyOn(actionUtils, 'isExactKeyMatch').mockImplementation(
    (key, cacheResult) => {
      const actualUtils = jest.requireActual('../src/utils/actionUtils')
      return actualUtils.isExactKeyMatch(key, cacheResult)
    }
  )

  jest.spyOn(actionUtils, 'isValidEvent').mockImplementation(() => {
    const actualUtils = jest.requireActual('../src/utils/actionUtils')
    return actualUtils.isValidEvent()
  })

  jest.spyOn(actionUtils, 'generateCacheKey').mockImplementation((packageManager) => {
    return `${packageManager}-cache-key`
  })

  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    if (name === 'package-manager') return 'pnpm'
    else if (name === 'build') return 'true'
    else return undefined
  })
})

beforeEach(() => {
  process.env[Events.Key] = Events.Push
  process.env[RefKey] = 'refs/heads/feature-branch'
  process.env.packageManager = 'pnpm'

  jest.spyOn(actionUtils, 'isGhes').mockImplementation(() => false)
})

afterEach(() => {
  delete process.env[Events.Key]
  delete process.env[RefKey]
})

test('restore with invalid event outputs warning', async () => {
  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const failedMock = jest.spyOn(core, 'setFailed')
  const invalidEvent = 'commit_comment'
  process.env[Events.Key] = invalidEvent
  delete process.env[RefKey]
  await run()
  expect(logWarningMock).toHaveBeenCalledWith(
        `Event Validation Error: The event type ${invalidEvent} is not supported because it's not tied to a branch or tag ref.`
  )
  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('restore on GHES should no-op', async () => {
  jest.spyOn(actionUtils, 'isGhes').mockImplementation(() => true)

  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const restoreCacheMock = jest.spyOn(cache, 'restoreCache')

  await run()

  expect(restoreCacheMock).toHaveBeenCalledTimes(0)
  expect(logWarningMock).toHaveBeenCalledWith(
    'RushJS Helper action is not supported on GHES'
  )
})

test('restore with no cache found', async () => {
  const key = actionUtils.generateCacheKey('pnpm')
  const infoMock = jest.spyOn(core, 'info')
  const failedMock = jest.spyOn(core, 'setFailed')
  const stateMock = jest.spyOn(core, 'saveState')
  const restoreCacheMock = jest
    .spyOn(cache, 'restoreCache')
    .mockImplementationOnce(() => {
      return Promise.resolve(undefined)
    })

  await run()

  expect(restoreCacheMock).toHaveBeenCalledTimes(1)
  expect(restoreCacheMock).toHaveBeenCalledWith(CachePaths, key, RestoreKeys)

  expect(stateMock).toHaveBeenCalledWith('RUSHJS_HELPER_KEY', key)
  expect(failedMock).toHaveBeenCalledTimes(0)

  expect(infoMock).toHaveBeenCalledWith(
        `Cache not found for key: ${[key, ...RestoreKeys].join(', ')}.`
  )
})

test('restore with server error should fail', async () => {
  const key = actionUtils.generateCacheKey('pnpm')
  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const failedMock = jest.spyOn(core, 'setFailed')
  const stateMock = jest.spyOn(core, 'saveState')
  const restoreCacheMock = jest
    .spyOn(cache, 'restoreCache')
    .mockImplementationOnce(() => {
      throw new Error('HTTP Error Occurred')
    })
  await run()

  expect(restoreCacheMock).toHaveBeenCalledTimes(1)
  expect(restoreCacheMock).toHaveBeenCalledWith(CachePaths, key, RestoreKeys)

  expect(stateMock).toHaveBeenCalledWith('RUSHJS_HELPER_KEY', key)

  expect(logWarningMock).toHaveBeenCalledTimes(1)
  expect(logWarningMock).toHaveBeenCalledWith('HTTP Error Occurred')

  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('restore with restore keys and no cache found', async () => {
  const key = actionUtils.generateCacheKey('pnpm')

  const infoMock = jest.spyOn(core, 'info')
  const failedMock = jest.spyOn(core, 'setFailed')
  const stateMock = jest.spyOn(core, 'saveState')
  const restoreCacheMock = jest
    .spyOn(cache, 'restoreCache')
    .mockImplementationOnce(() => {
      return Promise.resolve(undefined)
    })

  await run()

  expect(restoreCacheMock).toHaveBeenCalledTimes(1)
  expect(restoreCacheMock).toHaveBeenCalledWith(CachePaths, key, RestoreKeys)

  expect(stateMock).toHaveBeenCalledWith('RUSHJS_HELPER_KEY', key)
  expect(failedMock).toHaveBeenCalledTimes(0)

  expect(infoMock).toHaveBeenCalledWith(
        `Cache not found for key: ${[key, ...RestoreKeys].join(', ')}.`
  )
})

test('restore with cache found for key', async () => {
  const key = actionUtils.generateCacheKey('pnpm')

  const infoMock = jest.spyOn(core, 'info')
  const failedMock = jest.spyOn(core, 'setFailed')
  const stateMock = jest.spyOn(core, 'saveState')
  const restoreCacheMock = jest
    .spyOn(cache, 'restoreCache')
    .mockImplementationOnce(() => {
      return Promise.resolve(key)
    })

  await run()

  expect(restoreCacheMock).toHaveBeenCalledTimes(1)
  expect(restoreCacheMock).toHaveBeenCalledWith(CachePaths, key, RestoreKeys)

  expect(stateMock).toHaveBeenCalledWith('RUSHJS_HELPER_KEY', key)

  expect(infoMock).toHaveBeenCalledWith(`Cache restored from key: ${key}`)
  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('restore with cache found for restore key', async () => {
  const key = actionUtils.generateCacheKey('pnpm')
  const infoMock = jest.spyOn(core, 'info')
  const failedMock = jest.spyOn(core, 'setFailed')
  const stateMock = jest.spyOn(core, 'saveState')
  const restoreCacheMock = jest
    .spyOn(cache, 'restoreCache')
    .mockImplementationOnce(() => {
      return Promise.resolve(RestoreKeys)
    })

  jest
    .spyOn(actionUtils, 'isExactKeyMatch')
    .mockImplementationOnce((primaryKey, cacheKey) => {
      return true
    })

  await run()

  expect(restoreCacheMock).toHaveBeenCalledTimes(1)
  expect(restoreCacheMock).toHaveBeenCalledWith(CachePaths, key, RestoreKeys)

  expect(stateMock).toHaveBeenCalledWith('RUSHJS_HELPER_KEY', key)

  expect(infoMock).toHaveBeenCalledWith(
        `Cache restored from key: ${RestoreKeys.join(',')}`
  )
  expect(failedMock).toHaveBeenCalledTimes(0)
})

/* eslint-env jest */
const cache = require('@actions/cache')
const core = require('@actions/core')

const { Events, RefKey, CachePaths } = require('../src/constants')
const run = require('../src/save')
const actionUtils = require('../src/utils/actionUtils')

jest.mock('@actions/cache')
jest.mock('../src/utils/actionUtils')

beforeAll(() => {
  jest.spyOn(actionUtils, 'getCacheState').mockImplementation(() => {
    return jest.requireActual('../src/utils/actionUtils').getCacheState()
  })

  jest.spyOn(actionUtils, 'isExactKeyMatch').mockImplementation(
    (key, cacheResult) => {
      return jest
        .requireActual('../src/utils/actionUtils')
        .isExactKeyMatch(key, cacheResult)
    }
  )

  jest.spyOn(actionUtils, 'isValidEvent').mockImplementation(() => {
    const actualUtils = jest.requireActual('../src/utils/actionUtils')
    return actualUtils.isValidEvent()
  })
})

beforeEach(() => {
  process.env[Events.Key] = Events.Push
  process.env[RefKey] = 'refs/heads/feature-branch'

  jest.spyOn(actionUtils, 'isGhes').mockImplementation(() => false)
})

afterEach(() => {
  delete process.env[Events.Key]
  delete process.env[RefKey]
})

test('save with invalid event outputs warning', async () => {
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

test('save with no primary key in state outputs warning', async () => {
  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const failedMock = jest.spyOn(core, 'setFailed')

  const savedCacheKey = 'rushjs-helper-bb828da54c148048dd17899ba9fda624811cfb43'
  jest.spyOn(core, 'getState')
  // Cache Entry State
    .mockImplementationOnce(() => {
      return savedCacheKey
    })
  // Cache Key State
    .mockImplementationOnce(() => {
      return ''
    })
  const saveCacheMock = jest.spyOn(cache, 'saveCache')

  await run()

  expect(saveCacheMock).toHaveBeenCalledTimes(0)
  expect(logWarningMock).toHaveBeenCalledWith(
    'Error retrieving key from state.'
  )
  expect(logWarningMock).toHaveBeenCalledTimes(1)
  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('save on GHES should no-op', async () => {
  jest.spyOn(actionUtils, 'isGhes').mockImplementation(() => true)

  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const saveCacheMock = jest.spyOn(cache, 'saveCache')

  await run()

  expect(saveCacheMock).toHaveBeenCalledTimes(0)
  expect(logWarningMock).toHaveBeenCalledWith(
    'This action is not supported on GHES'
  )
})

test('save with exact match returns early', async () => {
  const infoMock = jest.spyOn(core, 'info')
  const failedMock = jest.spyOn(core, 'setFailed')

  const primaryKey = 'rushjs-helper-bb828da54c148048dd17899ba9fda624811cfb43'
  const savedCacheKey = primaryKey

  jest.spyOn(core, 'getState')
  // Cache Entry State
    .mockImplementationOnce(() => {
      return savedCacheKey
    })
  // Cache Key State
    .mockImplementationOnce(() => {
      return primaryKey
    })
  const saveCacheMock = jest.spyOn(cache, 'saveCache')

  await run()

  expect(saveCacheMock).toHaveBeenCalledTimes(0)
  expect(infoMock).toHaveBeenCalledWith(
        `Cache hit occurred on the primary key ${primaryKey}, not saving cache.`
  )
  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('save with large cache outputs warning', async () => {
  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const failedMock = jest.spyOn(core, 'setFailed')

  const primaryKey = 'rushjs-helper-linux-bb828da54c148048dd17899ba9fda624811cfb43'
  const savedCacheKey = 'rushjs-helper-linux-'

  jest.spyOn(core, 'getState')
  // Cache Entry State
    .mockImplementationOnce(() => {
      return savedCacheKey
    })
  // Cache Key State
    .mockImplementationOnce(() => {
      return primaryKey
    })

  const saveCacheMock = jest
    .spyOn(cache, 'saveCache')
    .mockImplementationOnce(() => {
      throw new Error(
        'Cache size of ~6144 MB (6442450944 B) is over the 5GB limit, not saving cache.'
      )
    })

  await run()

  expect(saveCacheMock).toHaveBeenCalledTimes(1)
  expect(saveCacheMock).toHaveBeenCalledWith(
    CachePaths,
    primaryKey
  )

  expect(logWarningMock).toHaveBeenCalledTimes(1)
  expect(logWarningMock).toHaveBeenCalledWith(
    'Cache size of ~6144 MB (6442450944 B) is over the 5GB limit, not saving cache.'
  )
  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('save with reserve cache failure outputs warning', async () => {
  const infoMock = jest.spyOn(core, 'info')
  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const failedMock = jest.spyOn(core, 'setFailed')

  const primaryKey = 'rushjs-helper-linux-bb828da54c148048dd17899ba9fda624811cfb43'
  const savedCacheKey = 'rushjs-helper-linux-'

  jest.spyOn(core, 'getState')
  // Cache Entry State
    .mockImplementationOnce(() => {
      return savedCacheKey
    })
  // Cache Key State
    .mockImplementationOnce(() => {
      return primaryKey
    })

  const saveCacheMock = jest
    .spyOn(cache, 'saveCache')
    .mockImplementationOnce(() => {
      const actualCache = jest.requireActual('@actions/cache')
      throw new actualCache.ReserveCacheError(`Unable to reserve cache with key ${primaryKey}, another job may be creating this cache.`)
    })

  await run()

  expect(saveCacheMock).toHaveBeenCalledTimes(1)
  expect(saveCacheMock).toHaveBeenCalledWith(
    CachePaths,
    primaryKey
  )

  expect(infoMock).toHaveBeenCalledWith(
        `Unable to reserve cache with key ${primaryKey}, another job may be creating this cache.`
  )
  expect(logWarningMock).toHaveBeenCalledTimes(0)
  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('save with server error outputs warning', async () => {
  const logWarningMock = jest.spyOn(actionUtils, 'logWarning')
  const failedMock = jest.spyOn(core, 'setFailed')

  const primaryKey = 'rushjs-helper-bb828da54c148048dd17899ba9fda624811cfb43'
  const savedCacheKey = 'rushjs-helper-'

  jest.spyOn(core, 'getState')
  // Cache Entry State
    .mockImplementationOnce(() => {
      return savedCacheKey
    })
  // Cache Key State
    .mockImplementationOnce(() => {
      return primaryKey
    })

  const saveCacheMock = jest
    .spyOn(cache, 'saveCache')
    .mockImplementationOnce(() => {
      throw new Error('HTTP Error Occurred')
    })

  await run()

  expect(saveCacheMock).toHaveBeenCalledTimes(1)
  expect(saveCacheMock).toHaveBeenCalledWith(
    CachePaths,
    primaryKey
  )

  expect(logWarningMock).toHaveBeenCalledTimes(1)
  expect(logWarningMock).toHaveBeenCalledWith('HTTP Error Occurred')

  expect(failedMock).toHaveBeenCalledTimes(0)
})

test('save uploads a cache', async () => {
  const failedMock = jest.spyOn(core, 'setFailed')

  const primaryKey = 'rushjs-helper-bb828da54c148048dd17899ba9fda624811cfb43'
  const savedCacheKey = 'rushjs-helper-'

  jest.spyOn(core, 'getState')
  // Cache Entry State
    .mockImplementationOnce(() => {
      return savedCacheKey
    })
  // Cache Key State
    .mockImplementationOnce(() => {
      return primaryKey
    })

  const cacheId = 4
  const saveCacheMock = jest
    .spyOn(cache, 'saveCache')
    .mockImplementationOnce(() => {
      return Promise.resolve(cacheId)
    })

  await run()

  expect(saveCacheMock).toHaveBeenCalledTimes(1)
  expect(saveCacheMock).toHaveBeenCalledWith(CachePaths, primaryKey)

  expect(failedMock).toHaveBeenCalledTimes(0)
})

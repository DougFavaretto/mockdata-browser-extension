import { dataTypeDefinitions, labelByType } from '../shared/dataTypes'
import { GENERATE_MESSAGE_TYPE, PING_MESSAGE_TYPE } from '../shared/messages'
import { sortDefinitionsByFavorite } from '../shared/sortDataTypes'
import { loadExtensionConfig, watchConfigChanges } from '../shared/storage'
import type { DataType, ExtensionConfig, FillResult } from '../shared/types'

const ROOT_MENU_ID = 'fake-data:root'

const toMenuItemId = (dataType: DataType): string => `fake-data:${dataType}`

const parseDataTypeFromMenuId = (menuItemId: string): DataType | null => {
  if (!menuItemId.startsWith('fake-data:')) {
    return null
  }

  const maybeDataType = menuItemId.replace('fake-data:', '')
  const known = dataTypeDefinitions.find((item) => item.type === maybeDataType)
  return known ? known.type : null
}

const runContextMenuCall = (action: (done: () => void) => void, errorPrefix: string): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    action(() => {
      const lastError = chrome.runtime.lastError
      if (lastError) {
        reject(new Error(`${errorPrefix}: ${lastError.message}`))
        return
      }

      resolve()
    })
  })

const removeAllMenus = async (): Promise<void> => {
  await runContextMenuCall((done) => chrome.contextMenus.removeAll(done), 'Falha ao limpar menus')
}

const createMenu = async (props: chrome.contextMenus.CreateProperties): Promise<void> => {
  await runContextMenuCall((done) => chrome.contextMenus.create(props, done), `Falha ao criar menu ${String(props.id)}`)
}

const rebuildMenus = async (config: ExtensionConfig): Promise<void> => {
  await removeAllMenus()

  await createMenu({
    id: ROOT_MENU_ID,
    title: 'Gerar dado fake',
    contexts: ['editable'],
  })

  const orderedDefinitions = sortDefinitionsByFavorite(dataTypeDefinitions, config.items)

  for (const definition of orderedDefinitions) {
    if (!config.items[definition.type].enabled) {
      continue
    }

    await createMenu({
      id: toMenuItemId(definition.type),
      parentId: ROOT_MENU_ID,
      title: definition.label,
      contexts: ['editable'],
    })
  }
}

let rebuildQueue: Promise<void> = Promise.resolve()

const queueRebuildMenus = (reason: string, config?: ExtensionConfig): void => {
  rebuildQueue = rebuildQueue
    .catch(() => undefined)
    .then(async () => {
      const configToApply = config ?? (await loadExtensionConfig())
      await rebuildMenus(configToApply)
    })
    .catch((error) => {
      console.error(`Falha ao sincronizar menu de contexto (${reason}):`, error)
    })
}

const sendGenerateMessage = (tabId: number, dataType: DataType, frameId?: number): Promise<FillResult | null> =>
  new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: GENERATE_MESSAGE_TYPE,
        dataType,
      },
      frameId !== undefined ? { frameId } : undefined,
      (response) => {
        const lastError = chrome.runtime.lastError
        if (lastError) {
          reject(new Error(lastError.message))
          return
        }

        resolve((response ?? null) as FillResult | null)
      },
    )
  })

const sendPingMessage = (tabId: number, frameId?: number): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: PING_MESSAGE_TYPE,
      },
      frameId !== undefined ? { frameId } : undefined,
      () => {
        const lastError = chrome.runtime.lastError
        if (lastError) {
          reject(new Error(lastError.message))
          return
        }

        resolve()
      },
    )
  })

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const isMissingReceiverError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.message.includes('Receiving end does not exist') || error.message.includes('Could not establish connection')
  )
}

const injectContentScript = (tabId: number, frameId?: number): Promise<void> => {
  const contentScriptFile = chrome.runtime.getManifest().content_scripts?.[0]?.js?.[0]
  if (!contentScriptFile) {
    return Promise.reject(new Error('Arquivo de content script nao encontrado no manifest.'))
  }

  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: frameId !== undefined ? { tabId, frameIds: [frameId] } : { tabId, allFrames: true },
        files: [contentScriptFile],
      },
      () => {
        const lastError = chrome.runtime.lastError
        if (lastError) {
          reject(new Error(lastError.message))
          return
        }

        resolve()
      },
    )
  })
}

const waitForContentScript = async (tabId: number, frameId?: number): Promise<void> => {
  const maxAttempts = 20
  const delayMs = 50

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await sendPingMessage(tabId, frameId)
      return
    } catch (error) {
      if (!isMissingReceiverError(error)) {
        throw error
      }
    }

    await sleep(delayMs)
  }

  throw new Error('Content script nao respondeu a tempo apos injecao.')
}

const ensureContentScript = async (tabId: number, frameId?: number): Promise<void> => {
  try {
    await sendPingMessage(tabId, frameId)
    return
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      throw error
    }
  }

  await injectContentScript(tabId, frameId)
  await waitForContentScript(tabId, frameId)
}

const warmupContentScriptOnActiveTab = (): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id === undefined) {
        continue
      }

      void ensureContentScript(tab.id).catch(() => {
        // Ignora tabs onde a injecao nao e permitida (chrome://, chrome web store, etc).
      })
    }
  })
}

chrome.runtime.onInstalled.addListener(() => {
  queueRebuildMenus('onInstalled')
  warmupContentScriptOnActiveTab()
})

chrome.runtime.onStartup.addListener(() => {
  queueRebuildMenus('onStartup')
  warmupContentScriptOnActiveTab()
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab?.id === undefined || typeof info.menuItemId !== 'string') {
    return
  }
  const tabId = tab.id

  const dataType = parseDataTypeFromMenuId(info.menuItemId)
  if (!dataType) {
    return
  }

  void (async () => {
    try {
      let result: FillResult | null = null

      try {
        await ensureContentScript(tabId, info.frameId)
        result = await sendGenerateMessage(tabId, dataType, info.frameId)
      } catch (error) {
        if (isMissingReceiverError(error)) {
          await ensureContentScript(tabId)
          result = await sendGenerateMessage(tabId, dataType)
        } else {
          throw error
        }
      }

      if (!result?.ok) {
        console.warn(`Falha ao preencher ${labelByType[dataType]}: ${result?.reason ?? 'SEM_RESPOSTA'}`)
      }
    } catch (error) {
      console.warn(`Nao foi possivel preencher ${labelByType[dataType]}:`, error)
    }
  })()
})

watchConfigChanges((config) => {
  queueRebuildMenus('storageChange', config)
})

queueRebuildMenus('bootstrap')
warmupContentScriptOnActiveTab()

'use client'

import { useEffect, useMemo, useState } from 'react'
import { dataTypeDefinitions, labelByType } from '../shared/dataTypes'
import { createDefaultConfig } from '../shared/defaultConfig'
import { generateByType } from '../shared/generators'
import {
  findDuplicateShortcut,
  findShortcutConflict,
  formatShortcut,
  getReservedShortcutReason,
  isShortcutValid,
  shortcutFromKeyboardEvent,
} from '../shared/shortcut'
import { sortDefinitionsByFavorite } from '../shared/sortDataTypes'
import { loadExtensionConfig, saveExtensionConfig } from '../shared/storage'
import type { DataType, DateFormat, ExtensionConfig, PasswordOptions } from '../shared/types'
import { DATE_FORMATS } from '../shared/types'

type StatusKind = 'success' | 'error'
type Tab = 'data-types' | 'shortcuts' | 'settings'

interface PopupStatus {
  kind: StatusKind
  message: string
}

const dateFormatOptions: Array<{ value: DateFormat; label: string }> = [
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' },
]

const App = () => {
  const [config, setConfig] = useState<ExtensionConfig>(createDefaultConfig())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [capturingType, setCapturingType] = useState<DataType | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('data-types')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedType, setCopiedType] = useState<DataType | null>(null)
  const [status, setStatus] = useState<PopupStatus | null>(null)

  const showStatus = (kind: StatusKind, message: string) => {
    setStatus({ kind, message })
    setTimeout(() => {
      setStatus((previous) => (previous?.message === message ? null : previous))
    }, 3000)
  }

  useEffect(() => {
    let mounted = true

    void (async () => {
      try {
        const savedConfig = await loadExtensionConfig()
        if (!mounted) return

        setConfig(savedConfig)
      } catch (error) {
        if (!mounted) return

        showStatus('error', `Falha ao carregar configuração: ${String(error)}`)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!capturingType) return undefined

    const listener = (event: KeyboardEvent): void => {
      event.preventDefault()
      event.stopPropagation()

      if (event.key === 'Escape') {
        setCapturingType(null)
        return
      }

      const capturedShortcut = shortcutFromKeyboardEvent(event)
      if (!isShortcutValid(capturedShortcut)) {
        showStatus('error', 'Use pelo menos um modificador (Ctrl/Shift/Alt/Meta) + uma tecla')
        return
      }

      const conflict = findShortcutConflict(config.items, capturedShortcut, capturingType)
      if (conflict) {
        showStatus('error', `Atalho já está em uso para ${labelByType[conflict]}`)
        return
      }

      const reservedReason = getReservedShortcutReason(capturedShortcut)
      if (reservedReason) {
        showStatus('error', `Combinacao reservada pelo navegador. ${reservedReason}`)
        return
      }

      setConfig((previous) => ({
        ...previous,
        items: {
          ...previous.items,
          [capturingType]: {
            ...previous.items[capturingType],
            shortcut: capturedShortcut,
          },
        },
      }))
      setDirty(true)
      setCapturingType(null)
      showStatus('success', `Atalho definido para ${labelByType[capturingType]}`)
    }

    window.addEventListener('keydown', listener, true)

    return () => {
      window.removeEventListener('keydown', listener, true)
    }
  }, [capturingType, config.items])

  const duplicateShortcut = useMemo(() => findDuplicateShortcut(config.items), [config.items])

  const filteredDefinitions = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const filtered = dataTypeDefinitions.filter(
      (def) =>
        query === '' ||
        def.label.toLowerCase().includes(query) ||
        def.description.toLowerCase().includes(query) ||
        def.type.toLowerCase().includes(query),
    )

    return sortDefinitionsByFavorite(filtered, config.items)
  }, [searchQuery, config.items])

  const handleFavoriteToggle = (dataType: DataType): void => {
    setConfig((previous) => ({
      ...previous,
      items: {
        ...previous.items,
        [dataType]: {
          ...previous.items[dataType],
          favorite: !previous.items[dataType].favorite,
        },
      },
    }))
    setDirty(true)
  }

  const handleToggle = (dataType: DataType): void => {
    setConfig((previous) => ({
      ...previous,
      items: {
        ...previous.items,
        [dataType]: {
          ...previous.items[dataType],
          enabled: !previous.items[dataType].enabled,
        },
      },
    }))
    setDirty(true)
  }

  const handleDateFormatChange = (nextValue: DateFormat): void => {
    if (!DATE_FORMATS.includes(nextValue)) return

    setConfig((previous) => ({
      ...previous,
      dateFormat: nextValue,
    }))
    setDirty(true)
  }

  const handleKeyboardShortcutsEnabledChange = (): void => {
    setConfig((previous) => ({
      ...previous,
      keyboardShortcutsEnabled: !previous.keyboardShortcutsEnabled,
    }))
    setDirty(true)
  }

  const handlePasswordLengthChange = (nextLength: number): void => {
    setConfig((previous) => ({
      ...previous,
      passwordOptions: {
        ...previous.passwordOptions,
        length: nextLength,
      },
    }))
    setDirty(true)
  }

  const handlePasswordFlagChange = (key: keyof Omit<PasswordOptions, 'length'>): void => {
    setConfig((previous) => ({
      ...previous,
      passwordOptions: {
        ...previous.passwordOptions,
        [key]: !previous.passwordOptions[key],
      },
    }))
    setDirty(true)
  }

  const handleClearShortcut = (dataType: DataType): void => {
    setConfig((previous) => ({
      ...previous,
      items: {
        ...previous.items,
        [dataType]: {
          ...previous.items[dataType],
          shortcut: null,
        },
      },
    }))
    setDirty(true)
    showStatus('success', `Atalho removido para ${labelByType[dataType]}`)
  }

  const handleCopyGeneratedValue = async (dataType: DataType): Promise<void> => {
    try {
      const value = generateByType(dataType, {
        dateFormat: config.dateFormat,
        passwordOptions: config.passwordOptions,
      })

      await navigator.clipboard.writeText(value)
      setCopiedType(dataType)
      setTimeout(() => {
        setCopiedType((previous) => (previous === dataType ? null : previous))
      }, 1400)
      showStatus('success', `${labelByType[dataType]} copiado para a area de transferencia.`)
    } catch (error) {
      showStatus('error', `Nao foi possivel copiar ${labelByType[dataType]}: ${String(error)}`)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (
      config.passwordOptions.length < 8 ||
      config.passwordOptions.length > 64 ||
      (!config.passwordOptions.uppercase &&
        !config.passwordOptions.lowercase &&
        !config.passwordOptions.numbers &&
        !config.passwordOptions.symbols)
    ) {
      showStatus('error', 'Configuracao de senha invalida. Revise tamanho e tipos de caracteres.')
      return
    }

    const duplicate = findDuplicateShortcut(config.items)
    if (duplicate) {
      showStatus('error', `Conflito entre ${labelByType[duplicate.first]} e ${labelByType[duplicate.second]}`)
      return
    }

    setSaving(true)
    try {
      const savedConfig = await saveExtensionConfig(config)
      setConfig(savedConfig)
      setDirty(false)
      showStatus('success', 'Configuracoes salvas com sucesso.')
    } catch (error) {
      showStatus('error', `Erro ao salvar: ${String(error)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRestoreDefaults = async (): Promise<void> => {
    if (!confirm('Tem certeza que deseja restaurar os padrões? Esta ação não pode ser desfeita.')) return

    const defaults = createDefaultConfig()
    setSaving(true)

    try {
      const savedDefaults = await saveExtensionConfig(defaults)
      setConfig(savedDefaults)
      setDirty(false)
      showStatus('success', 'Padroes restaurados com sucesso.')
    } catch (error) {
      showStatus('error', `Erro ao restaurar padroes: ${String(error)}`)
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = useMemo(() => {
    return Object.values(config.items).filter((item) => item.enabled).length
  }, [config.items])

  const shortcutsCount = useMemo(() => {
    return Object.values(config.items).filter((item) => item.shortcut).length
  }, [config.items])

  const passwordConfigValid =
    config.passwordOptions.length >= 8 &&
    config.passwordOptions.length <= 64 &&
    (config.passwordOptions.uppercase ||
      config.passwordOptions.lowercase ||
      config.passwordOptions.numbers ||
      config.passwordOptions.symbols)

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-120 bg-slate-50 p-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <header className="border-slate-200 border-b bg-linear-to-r from-slate-50 to-slate-100/50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mt-0.5 font-semibold text-lg text-slate-900">MockData Browser Extension</h1>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-lg bg-cyan-100 px-2 py-1 font-medium text-cyan-700">{enabledCount} ativos</span>
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <nav className="border-slate-200 border-b bg-slate-50/50 px-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('data-types')}
              className={`relative px-4 py-3 font-medium text-sm transition ${
                activeTab === 'data-types' ? 'text-cyan-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tipos de Dados
              {activeTab === 'data-types' && <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-cyan-600" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shortcuts')}
              className={`relative px-4 py-3 font-medium text-sm transition ${
                activeTab === 'shortcuts' ? 'text-cyan-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Atalhos
              <span className="ml-1.5 rounded-md bg-slate-200 px-1.5 py-0.5 font-semibold text-slate-700 text-xs">
                {shortcutsCount}
              </span>
              {activeTab === 'shortcuts' && <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-cyan-600" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`relative px-4 py-3 font-medium text-sm transition ${
                activeTab === 'settings' ? 'text-cyan-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Configurações
              {activeTab === 'settings' && <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-cyan-600" />}
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="p-4">
          {/* Data Types Tab */}
          {activeTab === 'data-types' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <svg
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar tipos de dados..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-slate-900 text-sm placeholder-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Data Types Grid */}
              <div className="grid grid-cols-1 gap-3">
                {filteredDefinitions.map((definition) => {
                  const item = config.items[definition.type]
                  const enabled = item.enabled
                  const isFavorite = item.favorite
                  const hasCopied = copiedType === definition.type

                  return (
                    <article
                      key={definition.type}
                      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all ${
                        enabled
                          ? 'border-cyan-200 bg-cyan-50/30 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 p-3 pb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold text-slate-900 text-sm">{definition.label}</h3>
                            <button
                              type="button"
                              onClick={() => handleFavoriteToggle(definition.type)}
                              disabled={loading || saving}
                              className={`rounded-md px-1.5 py-0.5 text-xs transition ${
                                isFavorite
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              aria-label={
                                isFavorite ? `Desfavoritar ${definition.label}` : `Favoritar ${definition.label}`
                              }
                              title={isFavorite ? 'Favorito' : 'Marcar como favorito'}
                            >
                              {isFavorite ? '★' : '☆'}
                            </button>
                          </div>
                          <p className="mt-1 line-clamp-2 text-slate-600 text-xs leading-relaxed">
                            {definition.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="mt-auto border-slate-200/70 border-t bg-slate-50/50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(definition.type)}
                            disabled={loading || saving}
                            className={`relative h-5 w-9 shrink-0 rounded-full transition ${enabled ? 'bg-cyan-500' : 'bg-slate-300'}`}
                            aria-label={`Ativar ${definition.label}`}
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${enabled ? 'left-4.5' : 'left-0.5'}`}
                            />
                          </button>
                          {item.shortcut ? (
                            <span className="flex items-center gap-1 rounded-md bg-slate-200 px-2 py-1 font-mono font-semibold text-[10px] text-slate-700">
                              {formatShortcut(item.shortcut)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sem atalho</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            void handleCopyGeneratedValue(definition.type)
                          }}
                          disabled={loading || saving}
                          className={`mt-2 w-full rounded-lg px-2 py-1.5 font-semibold text-xs transition ${
                            hasCopied ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                          }`}
                        >
                          {hasCopied ? 'Copiado' : 'Copiar valor gerado'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              {filteredDefinitions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="mb-3 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="font-medium text-slate-600 text-sm">Nenhum tipo encontrado</p>
                  <p className="mt-1 text-slate-500 text-xs">Tente buscar com outros termos</p>
                </div>
              )}
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 text-sm">Gerenciar atalhos de teclado</h2>
                {duplicateShortcut && (
                  <span className="flex items-center gap-1 text-rose-600 text-xs">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Conflito detectado
                  </span>
                )}
              </div>

              {!config.keyboardShortcutsEnabled && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 text-xs">
                  Atalhos globais estao desativados. Ative em Configuracoes para usar no preenchimento.
                </div>
              )}

              <div className="space-y-2">
                {dataTypeDefinitions.map((definition) => {
                  const item = config.items[definition.type]
                  const isCapturing = capturingType === definition.type
                  const hasConflict =
                    duplicateShortcut &&
                    (duplicateShortcut.first === definition.type || duplicateShortcut.second === definition.type)

                  return (
                    <article
                      key={definition.type}
                      className={`rounded-xl border p-3 transition ${
                        hasConflict
                          ? 'border-rose-300 bg-rose-50/50'
                          : isCapturing
                            ? 'border-amber-300 bg-amber-50/50'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 text-sm">{definition.label}</h3>
                            {!item.enabled && (
                              <span className="rounded-md bg-slate-200 px-1.5 py-0.5 font-medium text-[10px] text-slate-600">
                                Inativo
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {item.shortcut ? (
                              <span className="rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1.5 font-mono font-semibold text-slate-700 text-xs">
                                {formatShortcut(item.shortcut)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Nenhum atalho definido</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCapturingType(definition.type)
                              setStatus(null)
                            }}
                            disabled={loading || saving}
                            className={`rounded-lg px-3 py-1.5 font-medium text-xs transition ${
                              isCapturing ? 'bg-amber-500 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                            }`}
                          >
                            {isCapturing ? 'Aguardando...' : 'Definir'}
                          </button>
                          {item.shortcut && (
                            <button
                              type="button"
                              onClick={() => handleClearShortcut(definition.type)}
                              disabled={loading || saving}
                              className="rounded-lg bg-slate-200 px-3 py-1.5 font-medium text-slate-700 text-xs transition hover:bg-slate-300"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 font-semibold text-slate-900 text-sm">Formato de Data</h2>
                <p className="mb-3 text-slate-600 text-xs">Escolha como as datas serão formatadas ao gerar dados</p>
                <select
                  value={config.dateFormat}
                  disabled={loading || saving}
                  onChange={(event) => handleDateFormatChange(event.target.value as DateFormat)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                >
                  {dateFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 font-semibold text-slate-900 text-sm">Atalhos de Teclado</h2>
                <p className="mb-3 text-slate-600 text-xs">
                  Controle global para ativar ou desativar atalhos de preenchimento.
                </p>
                <button
                  type="button"
                  onClick={handleKeyboardShortcutsEnabledChange}
                  className={`relative h-7 w-13 rounded-full transition ${
                    config.keyboardShortcutsEnabled ? 'bg-cyan-500' : 'bg-slate-300'
                  }`}
                  aria-label="Habilitar atalhos de teclado"
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                      config.keyboardShortcutsEnabled ? 'left-6.5' : 'left-0.5'
                    }`}
                  />
                </button>
                <p className="mt-2 text-slate-600 text-xs">
                  Status atual: {config.keyboardShortcutsEnabled ? 'Ativado' : 'Desativado'}
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 font-semibold text-slate-900 text-sm">Configuracao de Senha</h2>
                <p className="mb-3 text-slate-600 text-xs">Defina regras para o gerador de senha.</p>

                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-slate-700 text-xs">Tamanho (8 a 64)</span>
                    <input
                      type="number"
                      min={8}
                      max={64}
                      value={config.passwordOptions.length}
                      onChange={(event) => handlePasswordLengthChange(Number(event.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePasswordFlagChange('uppercase')}
                      className={`rounded-lg border px-2 py-2 text-xs transition ${
                        config.passwordOptions.uppercase
                          ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      Maiusculas
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePasswordFlagChange('lowercase')}
                      className={`rounded-lg border px-2 py-2 text-xs transition ${
                        config.passwordOptions.lowercase
                          ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      Minusculas
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePasswordFlagChange('numbers')}
                      className={`rounded-lg border px-2 py-2 text-xs transition ${
                        config.passwordOptions.numbers
                          ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      Numeros
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePasswordFlagChange('symbols')}
                      className={`rounded-lg border px-2 py-2 text-xs transition ${
                        config.passwordOptions.symbols
                          ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      Simbolos
                    </button>
                  </div>

                  {!passwordConfigValid && (
                    <p className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-rose-700 text-xs">
                      A senha precisa ter tamanho entre 8 e 64 e ao menos um tipo de caractere ativo.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 font-semibold text-slate-900 text-sm">Estatísticas</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <p className="font-bold text-2xl text-cyan-600">{enabledCount}</p>
                    <p className="mt-1 text-slate-600 text-xs">Tipos ativos</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <p className="font-bold text-2xl text-cyan-600">{shortcutsCount}</p>
                    <p className="mt-1 text-slate-600 text-xs">Atalhos definidos</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="mb-2 font-semibold text-slate-900 text-sm">Restaurar Padrões</h2>
                <p className="mb-3 text-slate-600 text-xs">Redefine todas as configurações para os valores padrão</p>
                <button
                  type="button"
                  onClick={() => {
                    void handleRestoreDefaults()
                  }}
                  disabled={loading || saving}
                  className="w-full rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 font-semibold text-rose-700 text-sm transition hover:bg-rose-100 disabled:opacity-50"
                >
                  Restaurar Padrões
                </button>
              </section>
            </div>
          )}
        </div>

        {status && (
          <div
            className={`mx-4 mb-3 rounded-lg border px-3 py-2 text-xs ${
              status.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Footer Actions */}
        <footer className="border-slate-200 border-t bg-slate-50 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              void handleSave()
            }}
            disabled={loading || saving || !dirty || Boolean(duplicateShortcut) || !passwordConfigValid}
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-sm text-white transition hover:bg-cyan-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : dirty ? 'Salvar Alterações' : 'Salvo'}
          </button>
        </footer>
      </section>
    </main>
  )
}

export default App

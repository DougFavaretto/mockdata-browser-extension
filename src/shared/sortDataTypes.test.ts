import { describe, expect, it } from 'vitest'

import { dataTypeDefinitions } from './dataTypes'
import { createDefaultConfig } from './defaultConfig'
import { sortDefinitionsByFavorite } from './sortDataTypes'

describe('sortDefinitionsByFavorite', () => {
  it('keeps original order when no favorites are set', () => {
    const config = createDefaultConfig()
    const sorted = sortDefinitionsByFavorite(dataTypeDefinitions, config.items)

    expect(sorted.map((item) => item.type)).toEqual(dataTypeDefinitions.map((item) => item.type))
  })

  it('moves favorites to top and preserves base order within groups', () => {
    const config = createDefaultConfig()
    config.items.email.favorite = true
    config.items.cpf.favorite = true

    const sorted = sortDefinitionsByFavorite(dataTypeDefinitions, config.items).map((item) => item.type)

    expect(sorted.slice(0, 2)).toEqual(['cpf', 'email'])
    expect(sorted).toContain('cnpj')
    expect(sorted).toContain('loremIpsum')
  })
})

import type { DataTypeDefinition } from './dataTypes'
import type { DataType, GeneratorConfigItem } from './types'

export const sortDefinitionsByFavorite = (
  definitions: DataTypeDefinition[],
  items: Record<DataType, GeneratorConfigItem>,
): DataTypeDefinition[] =>
  [...definitions].sort((first, second) => {
    const firstFavorite = items[first.type].favorite
    const secondFavorite = items[second.type].favorite

    if (firstFavorite === secondFavorite) {
      return 0
    }

    return firstFavorite ? -1 : 1
  })

import type { DataType, Shortcut } from './types'

export interface DataTypeDefinition {
  type: DataType
  label: string
  description: string
  defaultShortcut: Shortcut | null
}

export const dataTypeDefinitions: DataTypeDefinition[] = [
  {
    type: 'cnpj',
    label: 'CNPJ',
    description: 'Gera CNPJ valido com mascara brasileira.',
    defaultShortcut: null,
  },
  {
    type: 'cpf',
    label: 'CPF',
    description: 'Gera CPF valido com mascara brasileira.',
    defaultShortcut: null,
  },
  {
    type: 'fullName',
    label: 'Nome completo',
    description: 'Gera nome e sobrenome.',
    defaultShortcut: null,
  },
  {
    type: 'username',
    label: 'Username',
    description: 'Gera nome de usuario para login.',
    defaultShortcut: null,
  },
  {
    type: 'password',
    label: 'Senha',
    description: 'Gera senha baseada nas configuracoes de seguranca.',
    defaultShortcut: null,
  },
  {
    type: 'uuid',
    label: 'UUID',
    description: 'Gera identificador UUID v4.',
    defaultShortcut: null,
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Gera email de teste.',
    defaultShortcut: null,
  },
  {
    type: 'phone',
    label: 'Telefone',
    description: 'Gera telefone brasileiro com DDD.',
    defaultShortcut: null,
  },
  {
    type: 'address',
    label: 'Endereco',
    description: 'Gera endereco completo em uma linha.',
    defaultShortcut: null,
  },
  {
    type: 'date',
    label: 'Data',
    description: 'Gera data com formato configuravel.',
    defaultShortcut: null,
  },
  {
    type: 'randomNumber',
    label: 'Numero aleatorio',
    description: 'Gera numero aleatorio entre 0 e 9999.',
    defaultShortcut: null,
  },
  {
    type: 'randomText',
    label: 'Texto aleatorio',
    description: 'Gera frase curta para testes.',
    defaultShortcut: null,
  },
  {
    type: 'url',
    label: 'URL',
    description: 'Gera URL valida para testes.',
    defaultShortcut: null,
  },
  {
    type: 'carPlate',
    label: 'Placa de carro',
    description: 'Gera placa Mercosul.',
    defaultShortcut: null,
  },
  {
    type: 'creditCard',
    label: 'Cartao de credito',
    description: 'Gera cartao valido por Luhn.',
    defaultShortcut: null,
  },
  {
    type: 'postalCode',
    label: 'Codigo postal (CEP)',
    description: 'Gera CEP com mascara 00000-000.',
    defaultShortcut: null,
  },
  {
    type: 'loremIpsum',
    label: 'Lorem ipsum',
    description: 'Gera paragrafo lorem ipsum.',
    defaultShortcut: null,
  },
]

export const labelByType = dataTypeDefinitions.reduce(
  (acc, item) => {
    acc[item.type] = item.label
    return acc
  },
  {} as Record<DataType, string>,
)

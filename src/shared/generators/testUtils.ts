export const onlyDigits = (value: string): string => value.replace(/\D/g, '')

export const validateCpf = (cpf: string): boolean => {
  const digits = onlyDigits(cpf)
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    return false
  }

  const calcDigit = (sliceLength: number): number => {
    let sum = 0
    for (let index = 0; index < sliceLength; index += 1) {
      sum += Number(digits[index]) * (sliceLength + 1 - index)
    }

    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return calcDigit(9) === Number(digits[9]) && calcDigit(10) === Number(digits[10])
}

export const validateCnpj = (cnpj: string): boolean => {
  const digits = onlyDigits(cnpj)
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) {
    return false
  }

  const calcDigit = (baseDigits: string, weights: number[]): number => {
    const sum = baseDigits.split('').reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0)

    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const firstDigit = calcDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calcDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13])
}

export const validateLuhn = (cardNumber: string): boolean => {
  const digits = onlyDigits(cardNumber)

  let sum = 0
  let shouldDouble = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = Number(digits[index])
    if (shouldDouble) {
      value *= 2
      if (value > 9) {
        value -= 9
      }
    }

    sum += value
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

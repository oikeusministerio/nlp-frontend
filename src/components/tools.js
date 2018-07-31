
export function getSubstiteByIndex(index) {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUWXYZ'.split('')
  const times = (index > 0) ? Math.ceil(index / alphabets.length) : 1
  const alphaIndex = index % alphabets.length
  const character = alphabets[alphaIndex]
  return Array(times + 1).join(character)
}

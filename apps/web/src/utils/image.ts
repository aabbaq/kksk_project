export function imageSrc (picture?: string): string {
  if (!picture || picture === 'default') return '/images/default.jpg'
  if (picture.startsWith('http://') || picture.startsWith('https://')) return picture
  if (picture.startsWith('/')) return picture
  // uploaded images stored as filename without extension
  if (/^\d+-/.test(picture)) return `/uploads/${picture}.jpg`
  return `/images/${picture}.jpg`
}

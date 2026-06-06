export function imageSrc (picture?: string): string {
  if (!picture || picture === 'default') return '/images/default.jpg'
  if (picture.startsWith('/')) return picture
  if (picture.startsWith('http')) return picture
  // uploaded images stored as filename without extension
  if (/^\d+-/.test(picture)) return `/uploads/${picture}.jpg`
  return `/images/${picture}.jpg`
}

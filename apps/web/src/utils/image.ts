export function imageSrc (picture?: string): string {
  if (!picture || picture === 'default') return '/images/default.jpg'
  if (picture.startsWith('http://') || picture.startsWith('https://')) return picture
  if (picture.startsWith('/')) return picture
  // legacy uploads: filename stem without extension (assume .jpg)
  if (/^\d+-/.test(picture)) {
    return picture.includes('.') ? `/uploads/${picture}` : `/uploads/${picture}.jpg`
  }
  return `/images/${picture}.jpg`
}

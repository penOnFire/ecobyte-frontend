export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  // JPG / JPEG
  'jpg',
  'jpeg',
  // PNG
  'png',
  // HEIC / HEIF
  'heic',
  'heif',
  // TIFF
  'tiff',
  'tif',
  // Camera RAW formats
  'raw',
  'dng',
  'cr2',
  'cr3',
  'nef',
  'nrw',
  'arw',
  'orf',
  'rw2',
  'pef',
  'raf',
])

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'image/tiff',
  'image/x-tiff',
  'image/x-adobe-dng',
  'image/x-canon-cr2',
  'image/x-canon-cr3',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-olympus-orf',
  'image/x-panasonic-rw2',
  'image/x-fuji-raf',
  'image/raw',
  'image/x-raw',
])

export const ALLOWED_IMAGE_ACCEPT = [
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.heif',
  '.tiff',
  '.tif',
  '.raw',
  '.dng',
  '.cr2',
  '.cr3',
  '.nef',
  '.nrw',
  '.arw',
  '.orf',
  '.rw2',
  '.pef',
  '.raf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/*',
].join(',')

/**
 * Validates that an uploaded file is a JPG, PNG, HEIC, TIFF, or RAW image and <= 10MB.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateResidentImageFile(file: File): string | null {
  const mime = (file.type || '').trim().toLowerCase()
  const extMatch = file.name?.toLowerCase().match(/\.([a-z0-9]+)$/)
  const ext = extMatch ? extMatch[1] : ''

  const hasValidMime = mime ? ALLOWED_IMAGE_MIME_TYPES.has(mime) : false
  const hasValidExt = ext ? ALLOWED_IMAGE_EXTENSIONS.has(ext) : false

  // Allow if either a valid extension or a valid MIME type is matched
  if (!hasValidMime && !hasValidExt) {
    return 'Unsupported file format. Only JPG, PNG, HEIC, TIFF, and RAW image formats are supported.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image exceeds the 10MB maximum file size limit. Please upload a smaller photo (max 10MB).'
  }

  if (file.size === 0) {
    return 'The selected file is empty. Please select a valid photo.'
  }

  return null
}

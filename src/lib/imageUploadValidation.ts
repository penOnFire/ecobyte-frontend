export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png'

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png'])
const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png'])

/**
 * Validates that a resident-uploaded file is a JPG, JPEG, or PNG image and <= 10MB.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateResidentImageFile(file: File): string | null {
  const mime = (file.type || '').trim().toLowerCase()
  const extMatch = file.name?.toLowerCase().match(/\.([a-z0-9]+)$/)
  const ext = extMatch ? extMatch[1] : ''

  const hasValidMime = mime ? ALLOWED_IMAGE_MIME_TYPES.has(mime) : false
  const hasValidExt = ext ? ALLOWED_IMAGE_EXTENSIONS.has(ext) : false

  if ((mime && !hasValidMime) || (ext && !hasValidExt) || (!hasValidMime && !hasValidExt)) {
    return 'Unsupported file format. Only JPG, JPEG, and PNG images are allowed.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image exceeds the 10MB maximum file size limit. Please upload a smaller photo.'
  }

  return null
}

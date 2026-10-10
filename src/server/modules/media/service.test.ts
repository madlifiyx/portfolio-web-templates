import { describe, expect, test } from 'bun:test'
import { validateUpload } from './service'

describe('validateUpload', () => {
  test('accepts a PNG signature', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0])], 'icon.png', {
      type: 'image/png',
    })
    const result = await validateUpload(file, 'contacts')
    expect(result.contentType).toBe('image/png')
  })

  test('rejects SVG uploads', async () => {
    const file = new File(['<svg></svg>'], 'icon.svg', { type: 'image/svg+xml' })
    expect(validateUpload(file, 'contacts')).rejects.toThrow('File type is not allowed')
  })

  test('rejects PDF as a contact icon', async () => {
    const file = new File(['%PDF-1.7'], 'icon.pdf', { type: 'application/pdf' })
    expect(validateUpload(file, 'contacts')).rejects.toThrow('File type is not allowed')
  })
})

export interface PickupVoucherPdfPayload {
  pickupCode: string
  itemTitle: string
  claimantName: string
  collectionPlace: string
  desk: string
  pickupDateLabel: string
  heldUntilLabel: string
  statusLabel: string
}

function sanitizePdfAscii(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generates a deterministic 21x21 verification matrix with standard 3-corner finder patterns
 * seeded from the voucher pickup code.
 */
export function buildVerificationMatrix(seedText: string): boolean[][] {
  const size = 21
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  )

  const stampFinder = (top: number, left: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4
        grid[top + r][left + c] = isBorder || isCore
      }
    }
  }

  stampFinder(0, 0)
  stampFinder(0, size - 7)
  stampFinder(size - 7, 0)

  let hash = 2166136261
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8
      const inTopRight = r < 8 && c >= size - 8
      const inBottomLeft = r >= size - 8 && c < 8
      if (inTopLeft || inTopRight || inBottomLeft) continue

      hash ^= (r * 31 + c * 17) & 0xff
      hash = Math.imul(hash, 16777619)
      grid[r][c] = (hash >>> 24) % 2 === 0
    }
  }

  return grid
}

export function generatePickupVoucherPdfBytes(
  data: PickupVoucherPdfPayload
): Uint8Array {
  const matrix = buildVerificationMatrix(`${data.pickupCode}|${data.itemTitle}`)
  const ops: string[] = []

  // Page background border card
  ops.push('0.98 0.98 0.96 rg')
  ops.push('0 0 612 792 re f')

  // Outer card frame
  ops.push('1 1 1 rg')
  ops.push('0.886 0.910 0.941 RG')
  ops.push('1 w')
  ops.push('42 72 528 678 re B')

  // Dark header banner (#0f172a)
  ops.push('0.059 0.090 0.165 rg')
  ops.push('42 642 528 108 re f')

  // Electric lime accent bar (#abf06b)
  ops.push('0.671 0.941 0.420 rg')
  ops.push('42 636 528 6 re f')

  // Header brand title
  ops.push('BT /F2 20 Tf 0.671 0.941 0.420 rg 66 708 Td (ECOBYTE) Tj ET')
  ops.push(
    'BT /F2 13 Tf 1 1 1 rg 66 686 Td (OFFICIAL RESIDENT PICK-UP VOUCHER) Tj ET'
  )
  ops.push(
    'BT /F1 9 Tf 0.796 0.835 0.882 rg 66 666 Td (Barangay Commonwealth Circular Electronics Recovery Initiative - Quezon City) Tj ET'
  )

  // Official Pick-Up Code highlight box
  ops.push('0.941 0.992 0.957 rg')
  ops.push('0.086 0.639 0.290 RG')
  ops.push('1.5 w')
  ops.push('66 530 332 82 re B')

  ops.push(
    'BT /F2 9 Tf 0.082 0.502 0.239 rg 82 592 Td (OFFICIAL VERIFICATION CODE) Tj ET'
  )
  ops.push(
    `BT /F3 26 Tf 0.059 0.090 0.165 rg 82 556 Td (${sanitizePdfAscii(data.pickupCode)}) Tj ET`
  )
  ops.push(
    `BT /F2 9 Tf 0.392 0.455 0.545 rg 82 539 Td (Status: ${sanitizePdfAscii(data.statusLabel)}) Tj ET`
  )

  // Verification QR Matrix box on top right
  const qrSize = 84
  const qrX = 438
  const qrY = 528
  ops.push('1 1 1 rg')
  ops.push('0.059 0.090 0.165 RG')
  ops.push('1 w')
  ops.push(`${qrX - 6} ${qrY - 6} ${qrSize + 12} ${qrSize + 12} re B`)

  const cellSize = qrSize / matrix.length
  ops.push('0.059 0.090 0.165 rg')
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue
      const x = (qrX + c * cellSize).toFixed(2)
      const y = (qrY + (matrix.length - 1 - r) * cellSize).toFixed(2)
      const w = cellSize.toFixed(2)
      ops.push(`${x} ${y} ${w} ${w} re f`)
    }
  }

  // Details section heading
  ops.push(
    'BT /F2 11 Tf 0.059 0.090 0.165 rg 66 496 Td (RESERVATION & CLAIMANT DETAILS) Tj ET'
  )
  ops.push('0.886 0.910 0.941 RG 0.8 w 66 488 m 546 488 l S')

  const rows: Array<[string, string]> = [
    ['Reserved Item', data.itemTitle],
    ['Claimant Name', data.claimantName],
    ['Collection Location', data.collectionPlace],
    ['Assigned Desk', data.desk],
    ['Pick-up Schedule', data.pickupDateLabel],
    ['Hold Valid Until', data.heldUntilLabel],
  ]

  let rowY = 462
  for (const [label, value] of rows) {
    ops.push(
      `BT /F2 10 Tf 0.392 0.455 0.545 rg 66 ${rowY} Td (${sanitizePdfAscii(label)}) Tj ET`
    )
    ops.push(
      `BT /F2 10 Tf 0.059 0.090 0.165 rg 220 ${rowY} Td (${sanitizePdfAscii(value)}) Tj ET`
    )
    ops.push(`0.945 0.961 0.976 RG 0.6 w 66 ${rowY - 10} m 546 ${rowY - 10} l S`)
    rowY -= 32
  }

  // Instructions Card
  ops.push('0.973 0.980 0.988 rg')
  ops.push('0.800 0.835 0.882 RG')
  ops.push('0.8 w')
  ops.push('66 136 480 112 re B')

  ops.push(
    'BT /F2 10 Tf 0.059 0.090 0.165 rg 82 226 Td (HUB RELEASE INSTRUCTIONS) Tj ET'
  )
  const instructions = [
    '1. Present this voucher PDF or your digital code at the assigned Barangay Commonwealth hub desk.',
    '2. Present a valid Barangay ID or resident account email so the officer can verify custody.',
    '3. Capture your quick handover photo in the EcoByte app under Proof of Claim to complete claim.',
    '4. Unclaimed holds expire automatically after 48 hours and return to the community Reuse Hub.',
  ]
  let instY = 204
  for (const line of instructions) {
    ops.push(
      `BT /F1 9 Tf 0.278 0.333 0.412 rg 82 ${instY} Td (${sanitizePdfAscii(line)}) Tj ET`
    )
    instY -= 17
  }

  // Footer
  ops.push('0.886 0.910 0.941 RG 0.8 w 66 112 m 546 112 l S')
  ops.push(
    `BT /F1 8 Tf 0.392 0.455 0.545 rg 66 94 Td (Generated by EcoByte Resident Portal • Pass ${sanitizePdfAscii(data.pickupCode)} • Barangay Commonwealth, Quezon City) Tj ET`
  )

  const contentStream = ops.join('\n') + '\n'
  const encoder = new TextEncoder()
  const contentByteLength = encoder.encode(contentStream).length

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\nendobj\n',
    `7 0 obj\n<< /Length ${contentByteLength} >>\nstream\n${contentStream}endstream\nendobj\n`,
  ]

  const header = '%PDF-1.4\n'
  const chunks: string[] = [header]
  const offsets: number[] = [0]
  let currentOffset = encoder.encode(header).length

  for (const obj of objects) {
    offsets.push(currentOffset)
    chunks.push(obj)
    currentOffset += encoder.encode(obj).length
  }

  const xrefStart = currentOffset
  const xrefRows = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f ']
  for (let i = 1; i < offsets.length; i++) {
    xrefRows.push(`${String(offsets[i]).padStart(10, '0')} 00000 n `)
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  chunks.push(xrefRows.join('\n') + '\n' + trailer)

  return encoder.encode(chunks.join(''))
}

export function buildPickupVoucherPdfBlob(payload: PickupVoucherPdfPayload): Blob {
  const bytes = generatePickupVoucherPdfBytes(payload)
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
}

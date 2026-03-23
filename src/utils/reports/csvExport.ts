export function convertRowsToCSV(data: Array<Record<string, unknown>>): string {
  if (!data.length) return ''

  const firstRow = data[0]
  if (!firstRow) return ''

  const headers = Object.keys(firstRow)
  const csvHeaders = headers.map(header => `"${String(header).normalize('NFC').replace(/"/g, '""')}"`).join(',')

  const csvRows = data.map(row =>
    headers.map(header => {
      const rawValue = row[header] ?? ''
      const value = String(rawValue).normalize('NFC')
      return `"${value.replace(/"/g, '""')}"`
    }).join(',')
  )

  return [csvHeaders, ...csvRows].join('\n')
}

export function downloadCsvFile(csvContent: string, fileName: string): void {
  const utf8Bom = '\uFEFF'
  const blob = new Blob([utf8Bom, csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

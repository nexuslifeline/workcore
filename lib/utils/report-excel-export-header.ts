import type ExcelJS from 'exceljs'

export type ExcelOrganizationBannerOrg = {
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
}

/**
 * Company name row, optional address, optional phone|email|website line.
 * Returns the next 1-based row index after a double blank spacer (before report title block).
 */
export function appendExcelOrganizationBanner(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  lastCol: number,
  org: ExcelOrganizationBannerOrg
): number {
  let row = startRow

  worksheet.mergeCells(row, 1, row, lastCol)
  const companyCell = worksheet.getCell(row, 1)
  companyCell.value = org.name
  companyCell.font = { size: 16, bold: true }
  row++

  if (org.address) {
    worksheet.mergeCells(row, 1, row, lastCol)
    worksheet.getCell(row, 1).value = org.address
    worksheet.getCell(row, 1).font = { size: 10 }
    row++
  }

  const contactInfo: string[] = []
  if (org.phone) contactInfo.push(`Phone: ${org.phone}`)
  if (org.email) contactInfo.push(`Email: ${org.email}`)
  if (org.website) contactInfo.push(`Website: ${org.website}`)
  if (contactInfo.length > 0) {
    worksheet.mergeCells(row, 1, row, lastCol)
    worksheet.getCell(row, 1).value = contactInfo.join(' | ')
    worksheet.getCell(row, 1).font = { size: 9 }
    row++
  }

  row += 2
  return row
}

export type ReportExcelExportHeaderTitles = {
  title: string
  subtitle: string
  description?: string
}

/**
 * Merged title row + one row per non-empty subtitle line + optional description lines (e.g. locations).
 * Returns the next free 1-based row index after a blank spacer row.
 */
export function appendExcelReportTitleBlock(
  worksheet: ExcelJS.Worksheet,
  row: number,
  lastCol: number,
  header: ReportExcelExportHeaderTitles
): number {
  let r = row
  worksheet.mergeCells(r, 1, r, lastCol)
  worksheet.getCell(r, 1).value = header.title
  worksheet.getCell(r, 1).font = { size: 18, bold: true }
  r++

  for (const line of header.subtitle.split('\n')) {
    const t = line.trim()
    if (!t) continue
    worksheet.mergeCells(r, 1, r, lastCol)
    worksheet.getCell(r, 1).value = t
    worksheet.getCell(r, 1).font = { size: 10 }
    r++
  }

  const desc = header.description?.trim()
  if (desc) {
    for (const line of desc.split('\n')) {
      const t = line.trim()
      if (!t) continue
      worksheet.mergeCells(r, 1, r, lastCol)
      const cell = worksheet.getCell(r, 1)
      cell.value = t
      cell.font = { size: 10, color: { argb: 'FF6B7280' } }
      r++
    }
  }

  r++
  return r
}

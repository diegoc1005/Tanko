import * as XLSX from 'xlsx'

export interface ExportOptions {
  filename: string
  sheetName?: string
}

export interface TransaccionExport {
  id: string
  fecha: string
  tipo: string
  monto: number
  fee: number
  estado: string
  txHash: string
  conductor: string
  peticionId?: string
}

export interface PeticionExport {
  id: string
  fechaSolicitud: string
  conductor: string
  tipoCombustible: string
  litros: number
  montoSolicitado: number
  montoAprobado: number | null
  estado: string
  ubicacion: string
  motivo: string
}

export interface ConductorExport {
  id: string
  nombre: string
  email: string
  walletStellar: string
  limiteCredito: number
  totalPeticiones: number
  peticionesPendientes: number
  peticionesAprobadas: number
  peticionesRechazadas: number
}

export interface ReporteMensualExport {
  periodo: string
  empresa: string
  totalFondos: number
  totalLiberado: number
  totalFees: number
  numTransacciones: number
  numPeticiones: number
  numPeticionesAprobadas: number
  numPeticionesRechazadas: number
  conductorsActivos: number
}

/**
 * Genera un archivo Excel para transacciones
 */
export function exportTransacciones(data: TransaccionExport[], options: ExportOptions): Buffer {
  const workbook = XLSX.utils.book_new()
  
  // Hoja principal de transacciones
  const wsData = [
    ['ID', 'Fecha', 'Tipo', 'Monto (USDC)', 'Fee (USDC)', 'Estado', 'TX Hash', 'Conductor', 'Petición ID'],
    ...data.map(t => [
      t.id,
      t.fecha,
      t.tipo,
      t.monto,
      t.fee,
      t.estado,
      t.txHash || '-',
      t.conductor,
      t.peticionId || '-',
    ])
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(wsData)
  
  // Agregar resumen
  const totalMonto = data.reduce((sum, t) => sum + t.monto, 0)
  const totalFee = data.reduce((sum, t) => sum + t.fee, 0)
  
  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['RESUMEN'],
    ['Total Transacciones', data.length],
    ['Monto Total', totalMonto],
    ['Fee Total', totalFee],
    ['Monto Neto', totalMonto - totalFee],
  ], { origin: -1 })

  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Transacciones')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

/**
 * Genera un archivo Excel para peticiones
 */
export function exportPeticiones(data: PeticionExport[], options: ExportOptions): Buffer {
  const workbook = XLSX.utils.book_new()
  
  const wsData = [
    ['ID', 'Fecha Solicitud', 'Conductor', 'Tipo Combustible', 'Litros', 'Monto Solicitado', 'Monto Aprobado', 'Estado', 'Ubicación', 'Motivo'],
    ...data.map(p => [
      p.id,
      p.fechaSolicitud,
      p.conductor,
      p.tipoCombustible,
      p.litros,
      p.montoSolicitado,
      p.montoAprobado || '-',
      p.estado,
      p.ubicacion,
      p.motivo || '-',
    ])
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(wsData)
  
  // Resumen
  const totalSolicitado = data.reduce((sum, p) => sum + p.montoSolicitado, 0)
  const totalAprobado = data.reduce((sum, p) => sum + (p.montoAprobado || 0), 0)
  const pendientes = data.filter(p => p.estado === 'PENDIENTE').length
  const aprobadas = data.filter(p => p.estado === 'APROBADA' || p.estado === 'COMPLETADA').length
  
  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['RESUMEN'],
    ['Total Peticiones', data.length],
    ['Pendientes', pendientes],
    ['Aprobadas/Completadas', aprobadas],
    ['Total Solicitado', totalSolicitado],
    ['Total Aprobado', totalAprobado],
  ], { origin: -1 })

  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Peticiones')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

/**
 * Genera un archivo Excel para conductores
 */
export function exportConductores(data: ConductorExport[], options: ExportOptions): Buffer {
  const workbook = XLSX.utils.book_new()
  
  const wsData = [
    ['ID', 'Nombre', 'Email', 'Wallet Stellar', 'Límite Crédito', 'Total Peticiones', 'Pendientes', 'Aprobadas', 'Rechazadas'],
    ...data.map(c => [
      c.id,
      c.nombre,
      c.email,
      c.walletStellar,
      c.limiteCredito,
      c.totalPeticiones,
      c.peticionesPendientes,
      c.peticionesAprobadas,
      c.peticionesRechazadas,
    ])
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(wsData)
  
  // Resumen
  const totalCreditos = data.reduce((sum, c) => sum + c.limiteCredito, 0)
  
  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['RESUMEN'],
    ['Total Conductores', data.length],
    ['Límite Crédito Total', totalCreditos],
  ], { origin: -1 })

  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Conductores')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

/**
 * Genera un reporte mensual completo
 */
export function exportReporteMensual(data: ReporteMensualExport, transacciones: TransaccionExport[], peticiones: PeticionExport[]): Buffer {
  const workbook = XLSX.utils.book_new()
  
  // Hoja de resumen
  const resumenData = [
    ['REPORTE MENSUAL - TANKO'],
    ['Período', data.periodo],
    ['Empresa', data.empresa],
    [],
    ['RESUMEN FINANCIERO'],
    ['Total Fondos en Escrow', data.totalFondos],
    ['Total Liberado', data.totalLiberado],
    ['Total Fees', data.totalFees],
    [],
    ['CONTADORES'],
    ['Transacciones', data.numTransacciones],
    ['Peticiones Totales', data.numPeticiones],
    ['Peticiones Aprobadas', data.numPeticionesAprobadas],
    ['Peticiones Rechazadas', data.numPeticionesRechazadas],
    ['Conductores Activos', data.conductorsActivos],
  ]
  
  const resumenWs = XLSX.utils.aoa_to_sheet(resumenData)
  XLSX.utils.book_append_sheet(workbook, resumenWs, 'Resumen')
  
  // Hoja de transacciones
  if (transacciones.length > 0) {
    const txData = [
      ['ID', 'Fecha', 'Tipo', 'Monto', 'Fee', 'Estado', 'TX Hash', 'Conductor'],
      ...transacciones.map(t => [
        t.id, t.fecha, t.tipo, t.monto, t.fee, t.estado, t.txHash || '-', t.conductor
      ])
    ]
    const txWs = XLSX.utils.aoa_to_sheet(txData)
    XLSX.utils.book_append_sheet(workbook, txWs, 'Transacciones')
  }
  
  // Hoja de peticiones
  if (peticiones.length > 0) {
    const petData = [
      ['ID', 'Fecha', 'Conductor', 'Tipo', 'Litros', 'Monto', 'Estado', 'Ubicación'],
      ...peticiones.map(p => [
        p.id, p.fechaSolicitud, p.conductor, p.tipoCombustible, p.litros, p.montoSolicitado, p.estado, p.ubicacion
      ])
    ]
    const petWs = XLSX.utils.aoa_to_sheet(petData)
    XLSX.utils.book_append_sheet(workbook, petWs, 'Peticiones')
  }
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

/**
 * Genera un nombre de archivo con timestamp
 */
export function generateFilename(prefix: string, extension: string = 'xlsx'): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${prefix}_${timestamp}.${extension}`
}

export default {
  exportTransacciones,
  exportPeticiones,
  exportConductores,
  exportReporteMensual,
  generateFilename,
}

import { describe, it, expect } from 'vitest'
import { 
  exportTransacciones, 
  exportPeticiones, 
  exportConductores,
  generateFilename,
  TransaccionExport,
  PeticionExport,
  ConductorExport
} from '@/lib/excel/export'

describe('Excel Export Service', () => {
  describe('generateFilename', () => {
    it('should generate filename with timestamp', () => {
      const filename = generateFilename('test')
      
      expect(filename).toMatch(/^test_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.xlsx$/)
    })

    it('should generate filename with custom extension', () => {
      const filename = generateFilename('test', 'csv')
      
      expect(filename).toMatch(/\.csv$/)
    })
  })

  describe('exportTransacciones', () => {
    it('should generate a buffer for transacciones', () => {
      const data: TransaccionExport[] = [
        {
          id: 'tx-1',
          fecha: '2024-03-20T10:00:00Z',
          tipo: 'RELEASE',
          monto: 4500,
          fee: 13.50,
          estado: 'CONFIRMADA',
          txHash: 'abc123',
          conductor: 'Juan Pérez',
        },
      ]

      const buffer = exportTransacciones(data, {
        filename: 'test_transacciones',
        sheetName: 'Transacciones',
      })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle empty data', () => {
      const buffer = exportTransacciones([], {
        filename: 'test_empty',
        sheetName: 'Transacciones',
      })

      expect(buffer).toBeInstanceOf(Buffer)
    })
  })

  describe('exportPeticiones', () => {
    it('should generate a buffer for peticiones', () => {
      const data: PeticionExport[] = [
        {
          id: 'pet-1',
          fechaSolicitud: '2024-03-20T10:00:00Z',
          conductor: 'Juan Pérez',
          tipoCombustible: 'diesel',
          litros: 180,
          montoSolicitado: 4500,
          montoAprobado: 4500,
          estado: 'APROBADA',
          ubicacion: 'Gasolinera Central',
          motivo: 'Carga de rutina',
        },
      ]

      const buffer = exportPeticiones(data, {
        filename: 'test_peticiones',
        sheetName: 'Peticiones',
      })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('exportConductores', () => {
    it('should generate a buffer for conductores', () => {
      const data: ConductorExport[] = [
        {
          id: 'cond-1',
          nombre: 'Juan Pérez',
          email: 'juan@test.com',
          walletStellar: 'GA2X...',
          limiteCredito: 5000,
          totalPeticiones: 10,
          peticionesPendientes: 2,
          peticionesAprobadas: 8,
          peticionesRechazadas: 0,
        },
      ]

      const buffer = exportConductores(data, {
        filename: 'test_conductores',
        sheetName: 'Conductores',
      })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })
})

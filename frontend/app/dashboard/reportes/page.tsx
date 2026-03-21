'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  DollarSign,
  Users,
  Receipt,
  Calendar
} from 'lucide-react'

type ExportType = 'transacciones' | 'peticiones' | 'conductores' | 'reporte-mensual'

export default function ReportesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-03')
  const [exporting, setExporting] = useState(false)

  const handleExport = async (tipo: ExportType) => {
    setExporting(true)
    try {
      const url = `/api/export?tipo=${tipo}${tipo === 'reporte-mensual' ? `&periodo=${selectedPeriod}` : ''}`
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas de tu flota
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select 
            className="border rounded-md px-3 py-2 text-sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="2024-03">Marzo 2024</option>
            <option value="2024-02">Febrero 2024</option>
            <option value="2024-01">Enero 2024</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total en Escrow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,230.00</div>
            <p className="text-xs text-muted-foreground">
              Balance actual del escrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liberado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,340.00</div>
            <p className="text-xs text-muted-foreground">
              Fondos liberados este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Con solicitudes este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Datos</CardTitle>
          <CardDescription>
            Descarga reportes en formato Excel para análisis detallado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleExport('transacciones')}
              disabled={exporting}
            >
              <FileSpreadsheet className="h-6 w-6" />
              <span className="font-medium">Transacciones</span>
              <span className="text-xs text-muted-foreground">
                Todas las transacciones del periodo
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleExport('peticiones')}
              disabled={exporting}
            >
              <Receipt className="h-6 w-6" />
              <span className="font-medium">Peticiones</span>
              <span className="text-xs text-muted-foreground">
                Solicitudes de fondos
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleExport('conductores')}
              disabled={exporting}
            >
              <Users className="h-6 w-6" />
              <span className="font-medium">Conductores</span>
              <span className="text-xs text-muted-foreground">
                Estadísticas por conductor
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleExport('reporte-mensual')}
              disabled={exporting}
            >
              <Download className="h-6 w-6" />
              <span className="font-medium">Reporte Mensual</span>
              <span className="text-xs text-muted-foreground">
                Reporte completo del mes
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consumption by Driver */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo por Conductor</CardTitle>
          <CardDescription>
            Distribución del consumo de combustible este mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Carlos López</span>
                <span className="font-medium">$5,100 (32%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '32%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Juan Pérez</span>
                <span className="font-medium">$4,500 (28%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '28%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>María García</span>
                <span className="font-medium">$3,200 (20%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '20%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Roberto Sánchez</span>
                <span className="font-medium">$2,800 (18%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '18%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Otros</span>
                <span className="font-medium">$1,740 (11%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground/30" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transacciones</CardTitle>
          <CardDescription>
            Registro de las transacciones más recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Fecha</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Conductor</th>
                  <th className="text-right py-3 px-2">Monto</th>
                  <th className="text-right py-3 px-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2">20/Mar 10:32</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Release
                    </span>
                  </td>
                  <td className="py-3 px-2">Juan Pérez</td>
                  <td className="py-3 px-2 text-right font-medium">$4,500.00</td>
                  <td className="py-3 px-2 text-right">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Confirmado
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">20/Mar 09:15</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Release
                    </span>
                  </td>
                  <td className="py-3 px-2">María García</td>
                  <td className="py-3 px-2 text-right font-medium">$3,200.00</td>
                  <td className="py-3 px-2 text-right">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Confirmado
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">19/Mar 18:45</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Release
                    </span>
                  </td>
                  <td className="py-3 px-2">Carlos López</td>
                  <td className="py-3 px-2 text-right font-medium">$5,100.00</td>
                  <td className="py-3 px-2 text-right">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Confirmado
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">19/Mar 14:00</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      Depósito
                    </span>
                  </td>
                  <td className="py-3 px-2">—</td>
                  <td className="py-3 px-2 text-right font-medium">$10,000.00</td>
                  <td className="py-3 px-2 text-right">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Confirmado
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

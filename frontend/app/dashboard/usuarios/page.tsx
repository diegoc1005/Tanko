"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Car,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/providers/auth-provider"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  stellarPubKey: string
  role: string
  units?: Array<{
    id: string
    plates: string
    make: string
    model: string
  }>
  createdAt: string
}

export default function UsersPage() {
  const { address: walletAddress } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchUsers() {
      console.log(`[Users] Fetching from ${BACKEND}/api/v1/users`)
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${BACKEND}/api/v1/users`)
        console.log(`[Users] Response status: ${res.status}`)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        console.log(`[Users] Response:`, data)

        if (data.success && data.data) {
          setUsers(data.data)
        } else {
          setUsers([])
        }
      } catch (err) {
        console.error("[Users] Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Error de conexión")
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [walletAddress])

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.stellarPubKey?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-destructive">Error al cargar usuarios</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestionar conductores y usuarios de la wallet de flota</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>Total: {users.length} usuarios registrados</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Contacto</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Wallet</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Unidades</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Creado: {new Date(user.createdAt).toLocaleDateString("es-MX")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          {user.email && (
                            <p className="flex items-center gap-1.5 text-sm text-foreground">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {user.email}
                            </p>
                          )}
                          {user.phone && (
                            <p className="flex items-center gap-1.5 text-sm text-foreground">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <code className="text-xs font-mono text-muted-foreground">
                          {user.stellarPubKey.slice(0, 12)}...{user.stellarPubKey.slice(-8)}
                        </code>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{user.units?.length || 0}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "JEFE"
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          {user.role === "JEFE" ? "Jefe de Flota" : "Conductor"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No hay usuarios registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Fuel, Loader2, Wallet } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'credentials' | 'wallet'>('credentials')

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales incorrectas')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletLogin = async () => {
    setIsLoading(true)
    setError('')

    // Simulated wallet login - in production, use Freighter
    try {
      // Here you would connect to Freighter and get the address
      // For now, simulate the flow
      setError('Conecta tu wallet Freighter para continuar')
    } catch (err) {
      setError('Error al conectar wallet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Fuel className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Tanko</CardTitle>
          <CardDescription>
            Monedero electrónico para combustible
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              onClick={() => setMode('credentials')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'credentials'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setMode('wallet')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'wallet'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Wallet
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          {mode === 'credentials' ? (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@transportesnorte.com"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Conecta tu wallet Freighter para iniciar sesión
              </p>
              <Button
                onClick={handleWalletLogin}
                className="w-full"
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Conectar con Freighter
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="underline underline-offset-4 hover:text-primary">
              Regístrate
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 3. components/auth/LoginHeader.tsx - Componente para el encabezado del login
"use client"

import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"

export function LoginHeader() {
  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center justify-center">
        <Logo />
      </div>
      <CardTitle className="text-2xl font-bold text-center">Liceo Taller San Miguel</CardTitle>
      <CardDescription className="text-center">Gestionar y consultar planes de estudio</CardDescription>
    </CardHeader>
  )
}

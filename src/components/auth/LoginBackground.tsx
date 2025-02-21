// 4. components/auth/LoginBackground.tsx - Componente para el fondo dividido
"use client"

export function LoginBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="h-1/2 bg-[#e00d2d]" />
      <div className="h-1/2" />
    </div>
  )
}
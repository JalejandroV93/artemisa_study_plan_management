// 6. app/page.tsx - Página principal refactorizada
"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useResponsiveAnimation } from "@/hooks/useResponsiveAnimation"
import { LoginForm } from "@/components/auth/LoginForm"
import { LoginHeader } from "@/components/auth/LoginHeader"
import { LoginBackground } from "@/components/auth/LoginBackground"
import { AnimatedLogo } from "@/components/auth/AnimatedLogo"

export default function LoginPage() {
  const { controls, logoControls } = useResponsiveAnimation()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background with split colors */}
      <LoginBackground />

      {/* Content */}
      <motion.div
        initial={{ y: 0 }}
        animate={controls}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md rounded-xl shadow-md z-10"
      >
        <Card>
          <LoginHeader />
          <LoginForm />
        </Card>
      </motion.div>

      {/* Logo animado con posición responsive */}
      <AnimatedLogo logoControls={logoControls} />
    </div>
  )
}
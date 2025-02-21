// src/app/access/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"
import { SpiralLoader } from "@/components/ui/spiral-loader";
import { APPLogo } from "@/components/ui/app_logo";
export default function AccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const jwt = searchParams.get("jwt");

    const handleSSOLogin = async () => {
      if (!jwt) {
        toast.error("Error", {
          description: "No se proporcionó un token de acceso."
        });
        router.push("/login?error=no_token");
        return;
      }

    toast("Validando acceso: Por favor, espere mientras validamos su información...");

      try {
        const response = await fetch("/api/auth/sso", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jwt }),
        });

        if (response.ok) {
          toast.success("Acceso validado", {
            description: "Redirigiendo al dashboard..."
          });
          router.push("/v1");
        } else {
          const errorData = await response.json();
          console.error("SSO validation error:", errorData);
          if (response.status === 403) {
            toast.error("Acceso denegado", {
              description: "No tiene permisos para acceder a esta página."
            });
            router.push("/forbidden");
          } else if (response.status === 401) {
            toast.error("Token inválido", {
              description: "El token de acceso proporcionado no es válido."
            });
            router.push("/?error=invalid_token");
          } else {
            toast.error("Error de autenticación", {
              description: "Ocurrió un error durante el proceso de autenticación."
            });
            router.push("/?error=sso_failed");
          }
        }
      } catch (error) {
        console.error("SSO validation error:", error);
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor de autenticación."
        });
        router.push("/?error=sso_failed");
      }
    };

    handleSSOLogin();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
       <APPLogo />
            <SpiralLoader />
            <p className="mt-[200px] text-lg">Validando acceso...</p>
    </div>
  );
}
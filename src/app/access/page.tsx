// src/app/access/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SpiralLoader } from "@/components/ui/spiral-loader";
import { APPLogo } from "@/components/ui/app_logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const jwt = searchParams.get("jwt");

    const handleSSOLogin = async () => {
      if (!jwt) {
        toast.error("Error", {
          description: "No se proporcionó un token de acceso.",
        });
        setTimeout(() => router.push("/login?error=no_token"), 3000);
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

        const data = await response.json();

        if (response.status === 403 && data.error === "cuenta bloqueada") {
          setShowBlockedModal(true);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          setError(data.error || "Error desconocido");
          if (response.status === 403) {
            toast.error("Acceso denegado", {
              description: "No tiene permisos para acceder a esta página.",
            });
            setTimeout(() => router.push("/"), 3000);
          } else if (response.status === 401) {
            toast.error("Token inválido", {
              description: "El token de acceso proporcionado no es válido.",
            });
            setTimeout(() => router.push("/?error=invalid_token"), 3000);
          } else {
            toast.error("Error de autenticación", {
              description: "Ocurrió un error durante el proceso de autenticación.",
            });
            setTimeout(() => router.push("/?error=sso_failed"), 3000);
          }
          return;
        }

        // Si todo salió bien
        toast.success("Acceso validado", {
          description: "Redirigiendo al dashboard...",
        });
        router.push("/v1");
      } catch (error) {
        console.error("SSO validation error:", error);
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor de autenticación.",
        });
        setTimeout(() => router.push("/?error=sso_failed"), 3000);
      }
    };

    // Solo iniciar el proceso si no estamos mostrando el modal
    if (!showBlockedModal) {
      handleSSOLogin();
    }
  }, [router, searchParams, showBlockedModal]);

  const handleBlockedAccountConfirm = () => {
    setShowBlockedModal(false);
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <APPLogo />
      {loading && !showBlockedModal && <SpiralLoader />}
      {loading && !showBlockedModal && (
        <p className="mt-[200px] text-lg">Validando acceso...</p>
      )}
      {error && !showBlockedModal && (
        <p className="mt-4 text-red-500">{error}</p>
      )}

      <Dialog open={showBlockedModal} onOpenChange={(isOpen) => {
        if (!isOpen) {
          router.push("/");
        }
        setShowBlockedModal(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cuenta bloqueada</DialogTitle>
            <DialogDescription>
              Su cuenta está bloqueada temporalmente. Por favor, contacte al administrador 
              o intente nuevamente más tarde.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleBlockedAccountConfirm}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
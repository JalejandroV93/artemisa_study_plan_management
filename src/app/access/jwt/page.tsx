"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
import { SpiralLoader } from "@/components/ui/spiral-loader";
import { LoginBackground } from "@/components/auth/LoginBackground";
export default function AccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });
  const redirectedRef = useRef(false);

  useEffect(() => {
    const jwt = searchParams.get("jwt");

    const handleSSOLogin = async () => {
      if (!jwt) {
        toast.dismiss();
        setErrorDialog({ isOpen: true, message: "No se proporcionó un token de acceso." });
        setLoading(false);
        return;
      }

      // Solo mostramos el toast si no hay error o redirección activa.
      if (!errorDialog.isOpen && !redirectedRef.current) {
        toast.info("Validando acceso: Por favor, espere mientras validamos su información...");
      }

      try {
        const response = await fetch("/api/auth/sso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwt }),
        });

        const data = await response.json();

        if (response.status === 403 && data.error === "cuenta bloqueada") {
          setShowBlockedModal(true);
          return;
        }

        if (!response.ok) {
          toast.dismiss();
          setErrorDialog({ isOpen: true, message: data.error || "Error desconocido en la autenticación." });
          return;
        }

        // Éxito: mostramos el toast y redirigimos.
        if (!redirectedRef.current) {
          toast.success("Acceso validado", { description: "Redirigiendo al dashboard..." });
          redirectedRef.current = true;
          router.push("/v1");
        }
      } catch (error) {
        console.error("SSO validation error:", error);
        toast.dismiss();
        setErrorDialog({ isOpen: true, message: "No se pudo conectar con el servidor de autenticación." });
      } finally {
        setLoading(false);
      }
    };

    if (!showBlockedModal && !errorDialog.isOpen && !redirectedRef.current) {
      handleSSOLogin();
    }
  }, [router, searchParams, showBlockedModal, errorDialog.isOpen]);

  const handleBlockedAccountConfirm = () => {
    setShowBlockedModal(false);
    router.push("/");
  };

  const handleErrorDialogClose = () => {
    setErrorDialog({ isOpen: false, message: "" });
    router.push("/");
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      {/* Overlay de fondo con efecto blur para los diálogos */}
      <LoginBackground />
      {(showBlockedModal || errorDialog.isOpen) && (
        <div className="fixed inset-0 z-40 bg-transparent backdrop-blur-sm" />
      )}

      <div className="flex flex-col gap-4 items-center justify-center z-50">
        <APPLogo />
        {loading && !showBlockedModal && <SpiralLoader />}
        {loading && !showBlockedModal && (
          <p className="mt-48 text-lg">Validando acceso...</p>
        )}
      </div>

      {/* Diálogo para cuenta bloqueada */}
      <Dialog
        open={showBlockedModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleBlockedAccountConfirm();
          }
          setShowBlockedModal(isOpen);
        }}
      >
        <DialogContent className="z-50">
          <DialogHeader>
          <APPLogo className="mx-auto w-[200px]" />
            <DialogTitle>Cuenta bloqueada</DialogTitle>
            <DialogDescription>
              Su cuenta está bloqueada temporalmente. Por favor, contacte al administrador o intente nuevamente más tarde.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleBlockedAccountConfirm}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para otros errores */}
      <Dialog
        open={errorDialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleErrorDialogClose();
          }
        }}
      >
        <DialogContent className="z-50">
          <DialogHeader>
          <APPLogo className="mx-auto w-[200px]" />
            <DialogTitle>Error de autenticación</DialogTitle>
            <DialogDescription>{errorDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleErrorDialogClose}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

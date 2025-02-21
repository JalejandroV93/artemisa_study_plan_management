"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SpiralLoader } from "@/components/ui/spiral-loader";
import { APPLogo } from "@/components/ui/app_logo";

export default function AccessPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/');
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <APPLogo />
            <SpiralLoader />
            <p className="mt-[200px] text-lg">Validando acceso...</p>
        </div>
    );
}

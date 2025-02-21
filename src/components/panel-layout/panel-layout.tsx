// src/components/admin-panel/admin-panel-layout.tsx
"use client";

import { Footer } from "@/components/panel-layout/footer";
import { Sidebar } from "@/components/panel-layout/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { useAuth } from "../providers/AuthProvider";
import { getMenuList } from "@/lib/menu-list";
import { usePathname } from "next/navigation";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);
   const { user } = useAuth();
    const pathname = usePathname();
    const menuList = getMenuList(pathname, user);
  if (!sidebar) return null;
  const { getOpenState, settings } = sidebar;
  return (
    <>
    <div className="flex">
      <Sidebar menuList={menuList} />
        <div
        className={cn(
          "flex-grow min-h-screen  bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72")
        )}
      >
        <Navbar  />
        <main
          className="min-h-[calc(100vh_-_56px)]"
        >
          {children}
        </main>
        <footer
        >
          <Footer />
        </footer>
       </div>
      </div>
    </>
  );
}
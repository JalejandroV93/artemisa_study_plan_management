// src/components/admin-panel/sidebar.tsx
"use client";

import { Menu } from "@/components/panel-layout/menu";
import { SidebarToggle } from "@/components/panel-layout/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { Group } from "@/lib/menu-list";
import { APPLogo } from "@/components/ui/app_logo";
import Image from "next/image";
import iconoArt from "@/assets/img/iconoart.svg"
interface SidebarProps{
    menuList: Group[]
}
export function Sidebar({menuList}:SidebarProps) {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col bg-background  px-3 py-2 overflow-y-auto shadow-md dark:shadow-zinc-800"
      >
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
            <Link href="/v1" className="flex items-center gap-2">
            <Image 
              src={iconoArt} 
              className={cn(
              "w-12 h-12 mr-1",
              getOpenState() ? "hidden" : "block"
              )} 
              alt="icono" 
            />
            <div
              className={cn(
              "font-bold text-lg text-zinc-900 dark:text-white whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
              !getOpenState()
                ? "-translate-x-96 opacity-0 hidden"
                : "translate-x-0 opacity-100"
              )}
            >
              <APPLogo className="w-40"/>
            </div>
            </Link>
        </Button>
        <Menu isOpen={getOpenState()} menuList={menuList} />
      </div>
    </aside>
  );
}
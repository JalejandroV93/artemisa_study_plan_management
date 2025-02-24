// src/components/admin-panel/navbar.tsx
"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/panel-layout/user-nav";
import { SheetMenu } from "@/components/panel-layout/sheet-menu";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          {/* Search Input (Placeholder) */}
          <div className="hidden items-center w-full max-w-sm">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
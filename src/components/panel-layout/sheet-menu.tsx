// src/components/panel-layout/sheet-menu.tsx
"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/panel-layout/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APPLogo } from "@/components/ui/app_logo";

// ADD THESE:
import { useAuth } from "@/components/providers/AuthProvider"; // Import
import { getMenuList } from "@/lib/menu-list";  // Import
import { usePathname } from "next/navigation";


export function SheetMenu() {

    const { user } = useAuth();
    const pathname = usePathname();
    const menuList = getMenuList(pathname, user);


  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/v1" className="flex items-center gap-2">
               <APPLogo className="w-40" />
            </Link>
          </Button>
        </SheetHeader>
        {/* Pass menuList here! */}
        <Menu isOpen menuList={menuList} />
      </SheetContent>
    </Sheet>
  );
}
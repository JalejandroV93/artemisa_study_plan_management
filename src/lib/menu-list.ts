// src/lib/menu-list.ts
import {
  Users,
  LayoutGrid,
  LucideIcon,
  BookOpen,
  Settings,
  Users2,  // Icon for Groups
  Book, //Icon for Subjects
  BrainCircuit,
  School,
  School2, //Icon for Picasso Promp
} from "lucide-react";

import { UserPayload } from "@/types/user";


type Submenu = {
  href: string;
  label: string;
  roles?: Array<UserPayload['role']>;  // Now correctly references the 'role' property
  icon?: LucideIcon;
};

type Menu = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean; // Consider removing 'active' if you're using pathname
  roles?: Array<UserPayload['role']>; // Correctly references the 'role' property
  submenus?: Submenu[];
};

export type Group = {  // Export the Group type
  groupLabel: string;
  menus: Menu[];
};



export function getMenuList(pathname: string, user: UserPayload | null): Group[] {
  const baseMenu: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/v1/",
          label: "Inicio",
          icon: LayoutGrid,
          roles: ['ADMIN'],
        },
      ],
    },
    {
      groupLabel: "Gestión de Estudios",
      menus: [
        {
          href: "/v1/subjects",
          label: "Planes de Estudio",
          icon: BookOpen,
          roles: ['ADMIN', 'TEACHER'],
        },
      ],
    },
    {
      groupLabel: "Administración",
      menus: [
        {
          href: "/v1/settings/users",
          label: "Usuarios",
          icon: Users,
          roles: ['ADMIN'],
        },
        {
          href: "/v1/settings/school",
          label: "Colegio",
          icon: School,
          roles: ['ADMIN'],
          submenus: [
            {
              href: "/v1/settings/sections",
              label: "Secciones",
              icon: School2,
              roles: ['ADMIN'],
            },
            {
              href: "/v1/settings/grades",
              label: "Grados",
              icon: Book,
              roles: ['ADMIN'],
            },
            {
              href: "/v1/settings/groups",
              label: "Grupos",
              icon: Users2,
              roles: ['ADMIN'],
            },
            {
              href: "/v1/settings/academic-years",
              label: "Años Académicos",
              icon: Book,
              roles: ['ADMIN'],
            }

        
          ],
        }
      ],
    },
    {
      groupLabel: "Configuraciones",
      menus: [
        {
          href: "#", // Parent menu, no direct link
          label: "Configuración",
          icon: Settings,
          roles: ['ADMIN'],
          submenus: [
            {
                href: "/v1/settings/picasso-prompt",
                label: "Prompt Picasso IA",
                icon: BrainCircuit,
                roles: ['ADMIN'],
              },
          ],
        },
      ],
    },
  ];

    // Filtrar los menús y submenús según el rol del usuario
    const filteredMenu = baseMenu.map(group => ({
      ...group,
      menus: group.menus.filter(menu => !menu.roles || (user && menu.roles.includes(user.role))).map(menu => ({
        ...menu,
        submenus: menu.submenus?.filter(submenu => !submenu.roles || (user && submenu.roles.includes(user.role)))
      }))
    }));

  return filteredMenu;
}
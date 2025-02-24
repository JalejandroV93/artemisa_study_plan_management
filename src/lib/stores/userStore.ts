/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/stores/userStore.ts
import { create } from 'zustand';
import { User } from '@prisma/client';

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isBlocked?: string;
  sortColumn?: string;
  sortOrder?: string;
}

interface UserState {
  users: User[];
  totalUsers: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchUsers: (params?: FetchUsersParams) => Promise<void>;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  totalUsers: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null,
  fetchUsers: async ({
    page = 1,
    limit = 10,
    search = '',
    role,
    isBlocked,
    sortColumn,
    sortOrder,
  }: FetchUsersParams = {}) => {
    set({ loading: true, error: null });
    try {
      // Construcción de la query string con los nuevos parámetros de ordenamiento
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
      });
      if (role) {
        params.append('role', role);
      }
      if (isBlocked) {
        params.append('isBlocked', isBlocked);
      }
      if (sortColumn) {
        params.append('sortColumn', sortColumn);
      }
      if (sortOrder) {
        params.append('sortOrder', sortOrder);
      }
      const response = await fetch(`/api/v1/users?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener los usuarios");
      }
      const data = await response.json();
      set({
        users: data.users,
        totalUsers: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  addUser: (user) =>
    set((state) => ({ users: [...state.users, user] })),
  updateUser: (updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      ),
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),
  blockUser: async (id) => {
    try {
      const response = await fetch(`/api/v1/users/${id}/block`, { method: 'PUT' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al bloquear el usuario");
      }
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, isBlocked: true } : user
        ),
      }));
    } catch (error: any) {
      console.error('Error bloqueando usuario:', error);
      set({ error: error.message });
    }
  },
  unblockUser: async (id) => {
    try {
      const response = await fetch(`/api/v1/users/${id}/unblock`, { method: 'PUT' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al desbloquear el usuario");
      }
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, isBlocked: false } : user
        ),
      }));
    } catch (error: any) {
      console.error('Error desbloqueando usuario:', error);
      set({ error: error.message });
    }
  },
  clearUsers: () =>
    set({ users: [], totalUsers: 0, page: 1, totalPages: 0, error: null }),
}));

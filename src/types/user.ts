// src/types/user.ts
import { JWTPayload } from 'jose';
import {  Role } from '@prisma/client'; // Import Rol

export interface UserPayload extends JWTPayload {
  id: number;
  username: string;
  rol: Role;
  nombre: string;
  email: string;
  phonenumber?: string | null;
}
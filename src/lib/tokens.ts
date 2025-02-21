// src/lib/tokens.ts (JWT handling using jose)

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { config } from './config';

// Function to create the token
export const createToken = async (payload: JWTPayload): Promise<string> => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d') // 1 day expiration
    .sign(new TextEncoder().encode(config.authSecret));
};

// Function to verify the token
export const verifyToken = async <T extends JWTPayload>(token: string): Promise<T> => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.authSecret));
    return payload as T;
  } catch (error) {
    console.error("Token verification error:", error); // Detailed error logging
    throw new Error('Token inválido'); // Consistent error message
  }
};
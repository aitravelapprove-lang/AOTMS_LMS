# Plan: Implement SocketProvider in useSocket.ts (Non-JSX)

## Goal
Fix the import error in `App.tsx` and the browser 404 for `useSocket.ts` by creating `Frontend/src/hooks/useSocket.ts` with valid TypeScript content (avoiding JSX).

## Changes

### 1. Create `Frontend/src/hooks/useSocket.ts`

-   **Why:** Browser is requesting `.ts` (cached or explicit import), but only `.tsx` exists.
-   **Content:** Same logic as `.tsx` but using `React.createElement` for rendering the Provider. This ensures valid TypeScript compilation without needing JSX syntax.

### 2. Delete `Frontend/src/hooks/useSocket.tsx`

-   **Why:** Avoid duplicate files and force resolution to the new `.ts` file.

## Implementation Details

The new `useSocket.ts` will look like this:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return apiUrl.replace('/api', '');
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const token = session?.access_token;
  // ... connection logic ...
  return React.createElement(
    SocketContext.Provider,
    { value: { socket, isConnected } },
    children
  );
};
```

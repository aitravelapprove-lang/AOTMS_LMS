# Plan: Implement SocketProvider in useSocket.ts

## Goal
Fix the import error in `App.tsx` by exporting `SocketProvider` from `Frontend/src/hooks/useSocket.ts`.

## Changes

### 1. Update `Frontend/src/hooks/useSocket.ts`

-   **Current State:** Exports only `useSocket` hook. Does not export `SocketProvider`.
-   **New State:**
    -   Exports `SocketProvider` component.
    -   Exports `useSocket` hook.
    -   Uses React Context to share a single socket connection.
    -   Uses `useAuth` hook to authenticate the socket connection.

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
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
```

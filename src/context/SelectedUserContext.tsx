"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/services/users";

interface SelectedUserContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

const SelectedUserContext = createContext<SelectedUserContextType | undefined>(undefined);

export function SelectedUserProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <SelectedUserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </SelectedUserContext.Provider>
  );
}

export function useSelectedUser() {
  const context = useContext(SelectedUserContext);
  if (context === undefined) {
    throw new Error("useSelectedUser must be used within a SelectedUserProvider");
  }
  return context;
}

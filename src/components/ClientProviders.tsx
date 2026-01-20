"use client";

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AlertProvider } from '@/context/AlertProvider';
import { AuthProvider } from '@/context/AuthContext';
import NextAuthProvider from '@/providers/NextAuthProvider';

export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ThemeProvider>
      <NextAuthProvider>
        <AuthProvider>
          <AlertProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </AlertProvider>
        </AuthProvider>
      </NextAuthProvider>
    </ThemeProvider>
  );
}

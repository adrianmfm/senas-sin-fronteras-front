'use client';

import { Header } from "@/components/Header";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};
"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PostJobLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
        if (!user) {
            router.push('/login');
        } else if (user.role !== 'Recruiter') {
            router.push('/');
        }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'Recruiter') {
    return null; 
  }

  return <>{children}</>;
}

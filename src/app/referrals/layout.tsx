
"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

export default function ReferralsLayout({
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
        } else if (user.role !== 'Employee') {
            router.push('/');
        }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'Employee') {
    return null; 
  }

  return <Suspense fallback={null}>{children}</Suspense>;
}

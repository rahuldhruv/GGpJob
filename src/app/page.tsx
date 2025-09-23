
"use client";

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";
import EmployeeDashboard from "@/components/dashboards/employee-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Super Admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'Admin') {
        router.push('/admin/users');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Skeleton className="h-48 w-1/3" />
                <Skeleton className="h-48 w-1/3" />
                <Skeleton className="h-48 w-1/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) {
       return (
         <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Welcome to GGP Portal</CardTitle>
                    <CardDescription>Please log in to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </CardContent>
            </Card>
         </div>
       );
    }
    
    switch(user.role) {
      case "Job Seeker":
        return <JobSeekerDashboard />;
      case "Recruiter":
        return <RecruiterDashboard />;
      case "Employee":
        return <EmployeeDashboard />;
      case "Admin":
      case "Super Admin":
        // Redirect is handled by useEffect, show a loader or null
        return (
             <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p>Loading Admin Dashboard...</p>
             </div>
        )
      default:
         router.push('/login');
         return null;
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {renderDashboard()}
    </div>
  );
}

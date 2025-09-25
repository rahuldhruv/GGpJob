"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/job-form";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostJobPage() {
    const { user, loading } = useUser();

    if (loading || !user) {
        return (
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                    <Card className="w-full max-w-3xl">
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                                <div className="flex justify-end">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                <Card className="w-full max-w-3xl">
                    <CardHeader>
                        <CardTitle>Post a New Job</CardTitle>
                        <CardDescription>
                            Fill out the details for the new job opening.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JobForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

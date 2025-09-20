
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalFeedbackForm } from "@/components/portal-feedback-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);
    
    if (userLoading || !user) {
        return (
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                     <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-10 w-1/2" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                             <div className="flex justify-end">
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Share Your Feedback</CardTitle>
                        <CardDescription>
                            We value your opinion! Let us know about your experience using the GGP Portal. 
                            Your feedback helps us improve.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PortalFeedbackForm userId={user.id} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

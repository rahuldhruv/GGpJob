"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/job-form";

export default function PostJobPage() {
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

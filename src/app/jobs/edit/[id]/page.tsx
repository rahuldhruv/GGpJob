"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/job-form";

async function getJobData(id: string): Promise<Job | null> {
    const res = await fetch(`/api/jobs/${id}`, { cache: 'no-store' });
    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        throw new Error('Failed to fetch job data');
    }
    return res.json();
}

export default function EditJobPage() {
    const params = useParams();
    const id = params.id as string;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const loadJob = async () => {
            try {
                setLoading(true);
                const jobData = await getJobData(id);
                if (!jobData) {
                    notFound();
                }
                setJob(jobData);
            } catch (err: any) {
                setError(err.message || "Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            loadJob();
        }
    }, [id]);

    if (loading) {
        return <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">Loading...</div>;
    }
    
    if (error) {
         return <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-destructive">Error: {error}</div>;
    }

    if (!job) {
        notFound();
    }
    
    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                <Card className="w-full max-w-3xl">
                    <CardHeader>
                        <CardTitle>Edit Job Posting</CardTitle>
                        <CardDescription>
                           Update the details for the job opening.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JobForm job={job} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

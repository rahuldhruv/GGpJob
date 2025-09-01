"use client"

import { useState, useEffect } from "react";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralReviewForm } from "@/components/referral-review-form";
import { notFound } from "next/navigation";

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


export default function EditReferralPage({ params }: { params: { id: string } }) {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const loadJob = async () => {
            try {
                setLoading(true);
                const jobData = await getJobData(params.id);
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
        loadJob();
    }, [params.id]);


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
                        <CardTitle>Edit Referral Job</CardTitle>
                        <CardDescription>
                           Update the details for the job you want to refer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReferralReviewForm job={job} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

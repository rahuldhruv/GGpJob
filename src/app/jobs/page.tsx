

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";

function JobSearchContent() {
    const searchParams = useSearchParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams.toString());
            const jobsUrl = `/api/jobs?${params.toString()}`;
            const jobsRes = await fetch(jobsUrl);
            const jobsData = await jobsRes.json();
            setJobs(Array.isArray(jobsData) ? jobsData : []);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const renderJobCards = () => {
        if (loading) {
            return <div className="text-center p-8">Loading...</div>
        }
        if (jobs.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )
        }
        return (
            <div className="text-center p-8">
                <p className="text-lg font-semibold">No jobs found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
        )
    }
    
    return (
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <div className="hidden lg:block">
                <JobFilters />
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <div>
                            <CardTitle>Job Openings</CardTitle>
                            <CardDescription>
                                {loading ? 'Searching for jobs...' : `Found ${jobs.length} job openings.`}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {renderJobCards()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function JobSearchPage() {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div>Loading...</div>}>
                <JobSearchContent />
            </Suspense>
        </div>
    );
}

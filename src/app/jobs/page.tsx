

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { useUser } from "@/contexts/user-context";

function JobSearchContent() {
    const searchParams = useSearchParams();
    const { user } = useUser();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [userApplications, setUserApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const isRecommended = searchParams.has('domain') && searchParams.get('domain') !== 'all';
    
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams.toString());
            const jobsUrl = `/api/jobs?${params.toString()}`;
            
            const fetchPromises: [Promise<Response>, Promise<Response> | null] = [
                fetch(jobsUrl),
                user ? fetch(`/api/applications?userId=${user.id}`) : null
            ];
            
            const [jobsRes, appsRes] = await Promise.all(fetchPromises);

            if (jobsRes.ok) {
                const jobsData = await jobsRes.json();
                setJobs(Array.isArray(jobsData) ? jobsData : []);
            }
            
            if (appsRes && appsRes.ok) {
                 const appsData = await appsRes.json();
                 setUserApplications(Array.isArray(appsData) ? appsData : []);
            }

        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, user]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs, searchParams.toString()]);
    
    const appliedJobIds = new Set(userApplications.map(app => app.jobId));

    const renderJobCards = () => {
        if (loading) {
            return <div className="text-center p-8">Loading...</div>
        }
        if (jobs.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} isApplied={appliedJobIds.has(job.id)} />
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
                            <CardTitle>{isRecommended ? 'Recommended Jobs' : 'Job Openings'}</CardTitle>
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

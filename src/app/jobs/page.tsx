
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

function JobSearchContent() {
    const searchParams = useSearchParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = useCallback(async (filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.posted !== 'all') params.append('posted', filters.posted);
            filters.location.forEach(loc => params.append('location', loc));
            if (filters.experience !== 'all') params.append('experience', filters.experience);
            filters.domain.forEach(dom => params.append('domain', dom));
            filters.jobType.forEach(type => params.append('jobType', type));

            const jobsUrl = `/api/jobs?${params.toString()}`;
            const jobsRes = await fetch(jobsUrl);
            const jobsData = await jobsRes.json();
            setJobs(Array.isArray(jobsData) ? jobsData : []);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const filters = {
            search: searchParams.get('search') || '',
            posted: searchParams.get('posted') || 'all',
            location: searchParams.getAll('location'),
            experience: searchParams.get('experience') || 'all',
            domain: searchParams.getAll('domain'),
            jobType: searchParams.getAll('jobType'),
        };
        fetchJobs(filters);
    }, [searchParams, fetchJobs]);

    const hasActiveFilters = () => {
        return searchParams.has('search') || searchParams.has('posted') || searchParams.has('location') || searchParams.has('experience') || searchParams.has('domain') || searchParams.has('jobType');
    }

    return (
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <div className="hidden lg:block">
                <JobFilters />
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Job Openings</CardTitle>
                        <CardDescription>
                            {loading ? 'Searching for jobs...' : `Found ${jobs.length} job openings.`}
                        </CardDescription>
                        {hasActiveFilters() && (
                             <div className="flex items-center gap-2 pt-2">
                                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/jobs'}>
                                    <X className="mr-2 h-4 w-4"/>
                                    Clear Filters
                                </Button>
                             </div>
                        )}
                    </CardHeader>
                    <CardContent>
                    {loading ? (
                        <div className="text-center p-8">Loading...</div>
                    ) : jobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-lg font-semibold">No jobs found</p>
                            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                        </div>
                    )}
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


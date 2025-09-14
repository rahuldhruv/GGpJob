
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function JobSearchContent() {
    const searchParams = useSearchParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = useCallback(async (filters: any) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.posted !== 'all') params.append('posted', filters.posted);
            if(Array.isArray(filters.location)) {
                filters.location.forEach((loc: string) => params.append('location', loc));
            }
            if (filters.experience !== 'all') params.append('experience', filters.experience);
            if(Array.isArray(filters.domain)) {
                filters.domain.forEach((dom: string) => params.append('domain', dom));
            }
            if(Array.isArray(filters.jobType)) {
                filters.jobType.forEach((type: string) => params.append('jobType', type));
            }

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
    
    const activeFilterCount = () => {
        let count = 0;
        if (searchParams.get('search')) count++;
        if (searchParams.get('posted') && searchParams.get('posted') !== 'all') count++;
        if (searchParams.getAll('location').length > 0) count++;
        if (searchParams.get('experience') && searchParams.get('experience') !== 'all') count++;
        if (searchParams.getAll('domain').length > 0) count++;
        if (searchParams.getAll('jobType').length > 0) count++;
        return count;
    }
    
    const hasActiveFilters = activeFilterCount() > 0;

    return (
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <div className="hidden lg:block">
                <JobFilters />
            </div>
            <div>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Job Openings</CardTitle>
                            <CardDescription>
                                {loading ? 'Searching for jobs...' : `Found ${jobs.length} job openings.`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/jobs'}>
                                    <X className="mr-2 h-4 w-4"/>
                                    Clear Filters
                                </Button>
                             )}
                             <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="lg:hidden">
                                        <SlidersHorizontal className="mr-2 h-4 w-4"/>
                                        Filters {hasActiveFilters && `(${activeFilterCount()})`}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <JobFilters />
                                </SheetContent>
                            </Sheet>
                        </div>
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

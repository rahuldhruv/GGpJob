

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  
  const fetchData = useCallback(async () => {
    if (user) {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                 user.domainId ? fetch(`/api/jobs?domain=${user.domainId}&limit=6`) : Promise.resolve(null),
                 fetch(`/api/applications?userId=${user.id}`)
            ]);

            if (jobsRes && jobsRes.ok) {
                const jobsData = await jobsRes.json();
                setRecommendedJobs(Array.isArray(jobsData) ? jobsData : []);
            }
            
            if (appsRes.ok) {
                 const appsData = await appsRes.json();
                 setUserApplications(Array.isArray(appsData) ? appsData : []);
            }

        } catch(error) {
            console.error("Failed to fetch dashboard data", error);
        }
    }
  }, [user]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const appliedJobIds = new Set(userApplications.map(app => app.jobId));
  
  return (
    <div className="space-y-8">
       <Card>
        <CardHeader>
          <CardTitle>Find your next job</CardTitle>
          <CardDescription>Search by title, company, or keywords to find your perfect match.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild>
                <Link href="/jobs">
                    Find a Job <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardContent>
      </Card>
      
      {user && !user.domainId && (
         <Card className="bg-primary-foreground border-primary/20">
            <CardHeader>
                <CardTitle>Get Personalized Job Recommendations!</CardTitle>
                <CardDescription>Select your preferred job domain in your profile to see jobs tailored just for you.</CardDescription>
            </CardHeader>
             <CardContent>
                <Button asChild>
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </CardContent>
         </Card>
      )}

      {recommendedJobs.length > 0 && (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Recommended For You
                    </CardTitle>
                    <CardDescription>Based on your preferred domain, here are some jobs you might be interested in.</CardDescription>
                </div>
                 {user?.domainId && (
                    <Button asChild variant="outline">
                        <Link href={`/jobs?domain=${user.domainId}`}>
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {recommendedJobs.map((job) => (
                        <CarouselItem key={job.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                               <JobCard job={job} isApplied={appliedJobIds.has(job.id)} />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </CardContent>
         </Card>
      )}
    </div>
  );
}

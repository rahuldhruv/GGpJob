

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { ThumbsUp, ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  
  const fetchRecommendedJobs = useCallback(async () => {
    if (user?.domainId) {
        try {
            const res = await fetch(`/api/jobs?domain=${user.domainId}&limit=6`);
            const data = await res.json();
            setRecommendedJobs(Array.isArray(data) ? data : []);
        } catch(error) {
            console.error("Failed to fetch recommended jobs", error);
        }
    }
  }, [user?.domainId]);


  useEffect(() => {
    fetchRecommendedJobs();
  }, [fetchRecommendedJobs]);
  
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
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Recommended For You
                </CardTitle>
                <CardDescription>Based on your preferred domain, here are some jobs you might be interested in.</CardDescription>
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
                               <JobCard job={job} />
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

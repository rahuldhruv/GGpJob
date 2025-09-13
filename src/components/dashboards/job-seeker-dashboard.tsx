

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job, Domain, ExperienceLevel, Location, JobType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Search, LoaderCircle, Filter, X, ThumbsUp } from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter } from "../multi-select-filter";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    posted: "all",
    location: [] as string[],
    experience: "all",
    domain: [] as string[],
    jobType: [],
  });

  const fetchJobs = useCallback(async () => {
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
  }, [filters]);
  
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

  const fetchFilterData = async () => {
     const [locationsRes, domainsRes, experienceLevelsRes, jobTypesRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/domains'),
        fetch('/api/experience-levels'),
        fetch('/api/job-types'),
    ]);
    setLocations(await locationsRes.json());
    setDomains(await domainsRes.json());
    setExperienceLevels(await experienceLevelsRes.json());
    setJobTypes(await jobTypesRes.json());
  }

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchRecommendedJobs();
  }, [fetchJobs, fetchRecommendedJobs]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const handleFilterChange = (filterName: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      search: "",
      posted: "all",
      location: [],
      experience: "all",
      domain: [],
      jobType: [],
    });
  }

  const hasActiveFilters = () => {
    return filters.search || filters.posted !== 'all' || filters.location.length > 0 || filters.experience !== 'all' || filters.domain.length > 0 || filters.jobType.length > 0;
  }
  
  const locationOptions = Array.isArray(locations) ? locations.map(loc => ({ value: String(loc.id), label: loc.name })) : [];
  const domainOptions = Array.isArray(domains) ? domains.map(d => ({ value: String(d.id), label: d.name })) : [];
  const jobTypeOptions = Array.isArray(jobTypes) ? jobTypes.map(jt => ({ value: String(jt.id), label: jt.name })) : [];

  return (
    <div className="space-y-8">
       <Card>
        <CardHeader>
          <CardTitle>Find your next job</CardTitle>
          <CardDescription>Search by title, company, or keywords. Use filters to refine your search.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative flex-grow">
              <Input 
                placeholder="e.g. 'Software Engineer' or 'Google'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={loading}>
                 {loading ? <LoaderCircle className="animate-spin h-5 w-5"/> : <Search className="h-5 w-5 text-muted-foreground" />}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-center">
              <div className="flex items-center gap-2 text-sm font-medium col-span-full lg:col-span-1">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <Select value={filters.posted} onValueChange={(value) => handleFilterChange('posted', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
               <MultiSelectFilter
                  title="Domains"
                  options={domainOptions}
                  selectedValues={filters.domain}
                  onChange={(selected) => handleFilterChange('domain', selected)}
              />
              <MultiSelectFilter
                  title="Locations"
                  options={locationOptions}
                  selectedValues={filters.location}
                  onChange={(selected) => handleFilterChange('location', selected)}
              />
              <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experienceLevels.map(level => <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>)}
                </SelectContent>
              </Select>
               <MultiSelectFilter
                  title="Employment Types"
                  options={jobTypeOptions}
                  selectedValues={filters.jobType}
                  onChange={(selected) => handleFilterChange('jobType', selected)}
              />
              {hasActiveFilters() && (
                 <Button variant="ghost" onClick={resetFilters} className="text-sm text-muted-foreground flex items-center justify-start lg:justify-center col-span-full lg:col-span-1">
                    <X className="mr-2 h-4 w-4"/>
                    Reset Filters
                </Button>
              )}
            </div>
          </form>
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
                    <ThumbsUp className="text-primary"/>
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

      <Card>
        <CardHeader>
          <CardTitle>{filters.search ? `Search Results for "${filters.search}"` : 'All Job Openings'}</CardTitle>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div>Loading...</div>
           ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p>No jobs found with the current criteria.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

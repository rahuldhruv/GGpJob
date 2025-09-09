
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job, Domain, ExperienceLevel, Location, JobType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Search, LoaderCircle, Filter, X } from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JobSeekerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    posted: "all",
    location: "all",
    experience: "all",
    domain: "all",
    jobType: "all",
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.posted !== 'all') params.append('posted', filters.posted);
      if (filters.location !== 'all') params.append('location', filters.location);
      if (filters.experience !== 'all') params.append('experience', filters.experience);
      if (filters.domain !== 'all') params.append('domain', filters.domain);
      if (filters.jobType !== 'all') params.append('jobType', filters.jobType);
      if (!filters.search && !params.has('posted') && !params.has('location') && !params.has('experience') && !params.has('domain') && !params.has('jobType')) {
        params.append('limit', '3');
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
  }, [filters]);
  
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
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await fetchFilterData();
        const initialJobsUrl = `/api/jobs?limit=3`;
        const initialJobsRes = await fetch(initialJobsUrl);
        const initialJobsData = await initialJobsRes.json();
        setJobs(Array.isArray(initialJobsData) ? initialJobsData : []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      search: "",
      posted: "all",
      location: "all",
      experience: "all",
      domain: "all",
      jobType: "all",
    });
  }

  const hasActiveFilters = () => {
    return filters.search || filters.posted !== 'all' || filters.location !== 'all' || filters.experience !== 'all' || filters.domain !== 'all' || filters.jobType !== 'all';
  }

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
               <Select value={filters.domain} onValueChange={(value) => handleFilterChange('domain', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experienceLevels.map(level => <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.jobType} onValueChange={(value) => handleFilterChange('jobType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {jobTypes.map(type => <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>)}
                </SelectContent>
              </Select>
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

      <Card>
        <CardHeader>
          <CardTitle>{filters.search ? `Search Results for "${filters.search}"` : 'Featured Jobs'}</CardTitle>
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

    

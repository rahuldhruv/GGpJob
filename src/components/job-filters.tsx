

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import type { Domain, ExperienceLevel, Location, JobType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter } from "./multi-select-filter";
import { X } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export function JobFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [locations, setLocations] = useState<Location[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    
    const [filters, setFilters] = useState({
        posted: searchParams.get('posted') || 'all',
        location: searchParams.getAll('location') || [],
        experience: searchParams.get('experience') || 'all',
        domain: searchParams.getAll('domain') || [],
        jobType: searchParams.getAll('jobType') || [],
    });

    useEffect(() => {
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
        fetchFilterData();
    }, []);

    const handleFilterChange = (filterName: string, value: string | string[]) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };
    
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams);
        
        Object.keys(filters).forEach(key => {
            params.delete(key);
        });

        if (filters.posted !== 'all') params.set('posted', filters.posted);
        if (filters.experience !== 'all') params.set('experience', filters.experience);
        filters.location.forEach(loc => params.append('location', loc));
        filters.domain.forEach(dom => params.append('domain', dom));
        filters.jobType.forEach(type => params.append('jobType', type));

        router.push(`/jobs?${params.toString()}`);
    }

    const clearFilters = () => {
        const currentSearch = searchParams.get('search');
        const newParams = new URLSearchParams();
        if (currentSearch) {
            newParams.set('search', currentSearch);
        }
        router.push(`/jobs?${newParams.toString()}`);
        setFilters({
             posted: 'all',
             location: [],
             experience: 'all',
             domain: [],
             jobType: [],
        });
    }

    const hasActiveFilters = 
        searchParams.get('posted') !== null && searchParams.get('posted') !== 'all' ||
        searchParams.getAll('location').length > 0 && !searchParams.getAll('location').includes('all') ||
        searchParams.get('experience') !== null && searchParams.get('experience') !== 'all' ||
        searchParams.getAll('domain').length > 0 && !searchParams.getAll('domain').includes('all') ||
        searchParams.getAll('jobType').length > 0 && !searchParams.getAll('jobType').includes('all');


    const locationOptions = Array.isArray(locations) ? locations.map(loc => ({ value: String(loc.id), label: loc.name })) : [];
    const domainOptions = Array.isArray(domains) ? domains.map(d => ({ value: String(d.id), label: d.name })) : [];
    const jobTypeOptions = Array.isArray(jobTypes) ? jobTypes.map(jt => ({ value: String(jt.id), label: jt.name })) : [];

    const ApplyButton = <Button onClick={applyFilters} className="w-full">Apply Filters</Button>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Filter Jobs</CardTitle>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4"/>
                        Clear
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Date Posted</label>
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
                </div>
                 <div>
                    <label className="text-sm font-medium">Domains</label>
                    <MultiSelectFilter
                        title="Domains"
                        options={domainOptions}
                        selectedValues={filters.domain}
                        onChange={(selected) => handleFilterChange('domain', selected)}
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium">Locations</label>
                     <MultiSelectFilter
                        title="Locations"
                        options={locationOptions}
                        selectedValues={filters.location}
                        onChange={(selected) => handleFilterChange('location', selected)}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Experience Level</label>
                    <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Experience Level" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {Array.isArray(experienceLevels) && experienceLevels.map(level => <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Employment Types</label>
                    <MultiSelectFilter
                        title="Employment Types"
                        options={jobTypeOptions}
                        selectedValues={filters.jobType}
                        onChange={(selected) => handleFilterChange('jobType', selected)}
                    />
                </div>

                <div className="flex flex-col space-y-2 pt-2">
                   {isClient && isMobile ? (
                        <SheetClose asChild>
                            {ApplyButton}
                        </SheetClose>
                    ) : ApplyButton}

                    {isClient && isMobile && (
                        <SheetClose asChild>
                            <Button variant="outline" className="w-full">Cancel</Button>
                        </SheetClose>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

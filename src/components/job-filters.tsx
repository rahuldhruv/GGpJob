
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import type { Domain, ExperienceLevel, Location, JobType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter } from "./multi-select-filter";

export function JobFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
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

    const locationOptions = Array.isArray(locations) ? locations.map(loc => ({ value: String(loc.id), label: loc.name })) : [];
    const domainOptions = Array.isArray(domains) ? domains.map(d => ({ value: String(d.id), label: d.name })) : [];
    const jobTypeOptions = Array.isArray(jobTypes) ? jobTypes.map(jt => ({ value: String(jt.id), label: jt.name })) : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter Jobs</CardTitle>
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
                        {experienceLevels.map(level => <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>)}
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

                <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
            </CardContent>
        </Card>
    );
}

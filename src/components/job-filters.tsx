

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import type { Domain, ExperienceLevel, Location, JobType } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter } from "./multi-select-filter";
import { X, Calendar, MapPin, Briefcase, ChevronRight, Layers, Award } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

interface JobFiltersProps {
    isSheet?: boolean;
}

type FilterCategory = 'posted' | 'domain' | 'location' | 'experience' | 'jobType';


export function JobFilters({ isSheet = false }: JobFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [locations, setLocations] = useState<Location[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [activeCategory, setActiveCategory] = useState<FilterCategory>('posted');
    
    const [filters, setFilters] = useState({
        posted: searchParams.get('posted') || 'all',
        location: searchParams.getAll('location') || [],
        experience: searchParams.get('experience') || 'all',
        domain: searchParams.getAll('domain') || [],
        jobType: searchParams.getAll('jobType') || [],
    });
    
    const [hasActiveFilters, setHasActiveFilters] = useState(false);

     useEffect(() => {
        setIsClient(true);
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

    useEffect(() => {
        setHasActiveFilters(
            searchParams.get('posted') !== null && searchParams.get('posted') !== 'all' ||
            searchParams.getAll('location').length > 0 && !searchParams.getAll('location').includes('all') ||
            searchParams.get('experience') !== null && searchParams.get('experience') !== 'all' ||
            searchParams.getAll('domain').length > 0 && !searchParams.getAll('domain').includes('all') ||
            searchParams.getAll('jobType').length > 0 && !searchParams.getAll('jobType').includes('all')
        );
    }, [searchParams]);


    useEffect(() => {
        setFilters({
            posted: searchParams.get('posted') || 'all',
            location: searchParams.getAll('location') || [],
            experience: searchParams.get('experience') || 'all',
            domain: searchParams.getAll('domain') || [],
            jobType: searchParams.getAll('jobType') || [],
        });
    }, [searchParams]);

    const handleFilterChange = (filterName: string, value: string | string[]) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };
    
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams);
        
        Object.keys(filters).forEach(key => {
            const filterKey = key as keyof typeof filters;
            params.delete(filterKey);
            const value = filters[filterKey];
             if (Array.isArray(value)) {
                if (value.length > 0) {
                    value.forEach(v => params.append(filterKey, v));
                }
            } else if (value && value !== 'all') {
                params.set(filterKey, value);
            }
        });


        router.push(`/jobs?${params.toString()}`);
    }

    const clearFilters = () => {
        const currentSearch = searchParams.get('search');
        const newParams = new URLSearchParams();
        if (currentSearch) {
            newParams.set('search', currentSearch);
        }
        router.push(`/jobs?${newParams.toString()}`);
    }

    const locationOptions = Array.isArray(locations) ? locations.map(loc => ({ value: String(loc.id), label: loc.name })) : [];
    const domainOptions = Array.isArray(domains) ? domains.map(d => ({ value: String(d.id), label: d.name })) : [];
    const jobTypeOptions = Array.isArray(jobTypes) ? jobTypes.map(jt => ({ value: String(jt.id), label: jt.name })) : [];

    const postedOptions = [
        { value: "all", label: "All Dates" },
        { value: "1", label: "Last 24 hours" },
        { value: "7", label: "Last 7 days" },
        { value: "14", label: "Last 14 days" },
        { value: "30", label: "Last 30 days" },
    ];

    const filterCategories: { id: FilterCategory; label: string; icon: React.ElementType }[] = [
        { id: 'posted', label: 'Date Posted', icon: Calendar },
        { id: 'domain', label: 'Domains', icon: Layers },
        { id: 'location', label: 'Locations', icon: MapPin },
        { id: 'experience', label: 'Experience', icon: Award },
        { id: 'jobType', label: 'Employment', icon: Briefcase },
    ];
    
    if (isSheet) {
        return (
            <div className="h-full flex flex-col">
                <div className="grid grid-cols-3 h-full overflow-hidden">
                    <div className="col-span-1 bg-muted/50 border-r overflow-y-auto">
                        {filterCategories.map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "w-full text-left p-3 text-sm font-medium flex items-center justify-between",
                                    activeCategory === cat.id && "bg-background"
                                )}
                            >
                                <span className="flex items-center">
                                   {cat.label}
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                    <div className="col-span-2 p-4 overflow-y-auto">
                        <ScrollArea className="h-full pr-4">
                            {activeCategory === 'posted' && (
                                <RadioGroup value={filters.posted} onValueChange={(value) => handleFilterChange('posted', value)} className="space-y-2">
                                    {postedOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <RadioGroupItem value={option.value} id={`posted-${option.value}`} />
                                            <Label htmlFor={`posted-${option.value}`}>{option.label}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                            {activeCategory === 'domain' && (
                                <div className="space-y-2">
                                    {domainOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`domain-${option.value}`}
                                                checked={filters.domain.includes(option.value)}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.domain, option.value]
                                                        : filters.domain.filter(v => v !== option.value);
                                                    handleFilterChange('domain', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`domain-${option.value}`}>{option.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeCategory === 'location' && (
                                <div className="space-y-2">
                                    {locationOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`location-${option.value}`}
                                                checked={filters.location.includes(option.value)}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.location, option.value]
                                                        : filters.location.filter(v => v !== option.value);
                                                    handleFilterChange('location', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`location-${option.value}`}>{option.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeCategory === 'experience' && (
                                <RadioGroup value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="exp-all" />
                                        <Label htmlFor="exp-all">All Levels</Label>
                                    </div>
                                    {Array.isArray(experienceLevels) && experienceLevels.map(level => (
                                        <div key={level.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={level.name} id={`exp-${level.id}`} />
                                            <Label htmlFor={`exp-${level.id}`}>{level.name}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                             {activeCategory === 'jobType' && (
                                 <div className="space-y-2">
                                    {jobTypeOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`jobType-${option.value}`}
                                                checked={filters.jobType.includes(option.value)}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.jobType, option.value]
                                                        : filters.jobType.filter(v => v !== option.value);
                                                    handleFilterChange('jobType', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`jobType-${option.value}`}>{option.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
                 <div className="p-4 border-t mt-auto grid grid-cols-2 gap-2">
                     <Button variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>Clear All</Button>
                    <SheetClose asChild>
                        <Button onClick={applyFilters}>Apply Filters</Button>
                    </SheetClose>
                </div>
            </div>
        )
    }

    return (
        <Card className={cn(isClient && "rounded-t-lg")}>
            {isClient && hasActiveFilters && (
                <CardHeader className="flex flex-row items-center justify-end pt-4 pb-2 px-4">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4"/>
                        Clear
                    </Button>
                </CardHeader>
            )}
            <CardContent className="space-y-4 px-4 pb-4 pt-6">
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

                <div className="pt-2">
                <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
                </div>
            </CardContent>
        </Card>
    );
}

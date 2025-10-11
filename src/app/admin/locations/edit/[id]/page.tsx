

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import type { Location } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationForm } from "@/components/location-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/user-context";

export default function EditLocationPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const id = params.id as string;
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchLocation = async () => {
            setLoading(true);
            try {
                // In a real app with many locations, a dedicated /api/locations/[id] GET endpoint would be better.
                const res = await fetch('/api/locations');
                const locations = await res.json();
                const locationToEdit = Array.isArray(locations) ? locations.find(d => String(d.id) === id) : null;
                
                if (locationToEdit) {
                    setLocation(locationToEdit);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch location", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
    }, [id]);
    
    if (loading) {
       return (
            <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                    <Card className="w-full max-w-2xl">
                        <div className="hidden md:block">
                            <CardHeader>
                                 <Skeleton className="h-8 w-40 mb-2" />
                                 <Skeleton className="h-4 w-full" />
                            </CardHeader>
                        </div>
                        <CardContent className="pt-6 md:pt-0">
                           <div className="space-y-8">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="flex justify-end">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!location) {
        notFound();
    }

    return (
        <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-2xl">
                     <div className="hidden md:block">
                        <CardHeader>
                            <CardTitle>Edit Location</CardTitle>
                            <CardDescription>
                                Update the details of the location.
                            </CardDescription>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6 md:pt-0">
                        <LocationForm location={location} onSuccess={() => router.push('/admin/locations')} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

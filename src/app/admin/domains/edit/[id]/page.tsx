
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import type { Domain } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainForm } from "@/components/domain-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/user-context";

export default function EditDomainPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const id = params.id as string;
    const [domain, setDomain] = useState<Domain | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchDomain = async () => {
            setLoading(true);
            try {
                // Since there is no specific endpoint to get a single domain,
                // we fetch all and find the one we need.
                // In a real-world scenario with many domains, a dedicated API endpoint
                // like /api/domains/[id] would be more efficient.
                const res = await fetch('/api/domains');
                const domains = await res.json();
                const domainToEdit = Array.isArray(domains) ? domains.find(d => String(d.id) === id) : null;
                
                if (domainToEdit) {
                    setDomain(domainToEdit);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch domain", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchDomain();
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

    if (!domain) {
        notFound();
    }


    return (
        <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-2xl">
                     <div className="hidden md:block">
                        <CardHeader>
                            <CardTitle>Edit Domain</CardTitle>
                            <CardDescription>
                                Update the details of the job domain.
                            </CardDescription>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6 md:pt-0">
                        <DomainForm domain={domain} onSuccess={() => router.push('/admin/domains')} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

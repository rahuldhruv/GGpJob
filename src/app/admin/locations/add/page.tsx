
"use client";

import { LocationForm } from "@/components/location-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";


export default function AddLocationPage() {
    const router = useRouter();
    return (
        <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-2xl">
                     <div className="hidden md:block">
                        <CardHeader>
                            <CardTitle>Add New Location</CardTitle>
                            <CardDescription>
                                Enter the details for the new location.
                            </CardDescription>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6 md:pt-0">
                        <LocationForm location={null} onSuccess={() => router.push('/admin/locations')} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

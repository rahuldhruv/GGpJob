
"use client"

import { AdminCreationForm } from "@/components/admin-creation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function AddAdminPage() {
    const router = useRouter();

    return (
         <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-2xl">
                    <div className="hidden md:block">
                        <CardHeader>
                            <CardTitle>Create New Admin</CardTitle>
                            <CardDescription>
                                Enter the details for the new Admin user.
                            </CardDescription>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6 md:pt-0">
                        <AdminCreationForm onSuccess={() => router.push('/admin/users')} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

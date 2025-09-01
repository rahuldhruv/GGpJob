"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralForm } from "@/components/referral-form";

export default function PostReferralPage() {
    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                <Card className="w-full max-w-3xl">
                    <CardHeader>
                        <CardTitle>Post a Referral Job</CardTitle>
                        <CardDescription>
                            Fill out the details for the job you want to refer. Your submission will be reviewed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReferralForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

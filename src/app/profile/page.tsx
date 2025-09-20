
"use client"

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordForm } from "@/components/change-password-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileSections } from "@/components/profile-sections";
import { ResumeForm } from "@/components/resume-form";

export default function ProfilePage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    if (loading || !user) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>
                            Update your personal information here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm user={user} />
                    </CardContent>
                </Card>

                {user.role === 'Job Seeker' && (
                    <>
                        <Separator />
                         <Card>
                            <CardHeader>
                                <CardTitle>My Resume</CardTitle>
                                <CardDescription>
                                    Provide a link to your resume.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResumeForm user={user} />
                            </CardContent>
                        </Card>
                        <Separator />
                        <ProfileSections userId={user.id} isEditable={true} />
                    </>
                )}

                <Separator />
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Update your password here. Make sure it's a strong one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm userId={user.id} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

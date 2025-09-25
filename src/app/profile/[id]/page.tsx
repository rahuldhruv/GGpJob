

"use client"

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ProfileSections } from "@/components/profile-sections";
import type { User as UserType } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AtSign, Phone, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProfilePage() {
    const { user: currentUser, loading: currentUserLoading } = useUser();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [profileUser, setProfileUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = currentUser?.id === id;

    useEffect(() => {
        const fetchUser = async () => {
            if (id) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/users/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setProfileUser(data);
                    } else {
                       setProfileUser(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    setProfileUser(null);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUser();
    }, [id]);
    
    if (loading || currentUserLoading) {
        return (
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <Card>
                        <CardHeader className="flex flex-col items-center text-center">
                            <Skeleton className="h-24 w-24 rounded-full mb-4" />
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-6 w-64" />
                        </CardHeader>
                        <CardContent className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
                           <Skeleton className="h-5 w-24" />
                           <Skeleton className="h-5 w-24" />
                           <Skeleton className="h-5 w-24" />
                        </CardContent>
                    </Card>
                    <Separator />
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                           <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-1/3" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                           </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    
    if (!profileUser) {
        return <div className="container mx-auto p-4">User not found.</div>;
    }

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                 <Card>
                    <CardHeader className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarFallback className="text-3xl">
                                {profileUser.firstName.charAt(0)}{profileUser.lastName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-3xl">{profileUser.name}</CardTitle>
                        <CardDescription className="text-lg">{profileUser.headline}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <AtSign className="h-4 w-4"/> {profileUser.email}
                        </div>
                         <div className="flex items-center gap-2">
                           <Phone className="h-4 w-4"/> {profileUser.phone}
                        </div>
                        {profileUser.location && (
                             <div className="flex items-center gap-2">
                               <MapPin className="h-4 w-4"/> {profileUser.location}
                            </div>
                        )}
                    </CardContent>
                    {isOwnProfile && (
                        <CardFooter className="justify-center">
                           <button onClick={() => router.push('/profile')} className="text-primary hover:underline text-sm">
                                Edit My Profile
                            </button>
                        </CardFooter>
                    )}
                </Card>

                {profileUser.role === 'Job Seeker' && (
                    <>
                        <Separator />
                        <ProfileSections userId={profileUser.id} isEditable={isOwnProfile} />
                    </>
                )}
            </div>
        </div>
    );
}

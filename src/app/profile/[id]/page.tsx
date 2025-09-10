
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
import { getDb } from "@/lib/db";


async function getUserData(id: string): Promise<UserType | null> {
    if (!id) return null;
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
        return null;
    }
    const data = await res.json();
    return data;
}

export default function PublicProfilePage() {
    const { user: currentUser, loading: currentUserLoading } = useUser();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [profileUser, setProfileUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = currentUser?.id === Number(id);

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
        return <div className="container mx-auto p-4">Loading...</div>;
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


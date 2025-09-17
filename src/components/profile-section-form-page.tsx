
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileSectionForm } from './profile-section-form';

type Section = 'education' | 'employment' | 'projects' | 'languages';

interface ProfileSectionFormPageProps {
    section: Section;
    itemId?: string;
}

export function ProfileSectionFormPage({ section, itemId }: ProfileSectionFormPageProps) {
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [loading, setLoading] = useState(!!itemId);

    const isEditing = !!itemId;

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const fetchItem = useCallback(async () => {
        if (isEditing && user) {
            setLoading(true);
            try {
                const res = await fetch(`/api/users/${user.id}/profile?section=${section}`);
                const items = await res.json();
                const itemToEdit = items.find((item: any) => String(item.id) === itemId);
                if (itemToEdit) {
                    setEditingItem(itemToEdit);
                } else {
                    toast({ title: 'Error', description: 'Item not found.', variant: 'destructive' });
                    router.push('/profile');
                }
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to fetch item data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        }
    }, [isEditing, itemId, section, user, toast, router]);

    useEffect(() => {
        fetchItem();
    }, [fetchItem]);


    const handleFormSubmit = async (values: any) => {
        if (!user) return;

        const url = `/api/users/${user.id}/profile?section=${section}`;
        const method = isEditing ? 'PUT' : 'POST';

        let bodyData = { ...values };
        if (section === 'employment' && values.isCurrent) {
            bodyData.endDate = '';
        }
        delete bodyData.isCurrent;

        const body = JSON.stringify(isEditing ? { ...bodyData, id: editingItem.id } : bodyData);

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save data');
            }
            
            toast({ title: 'Success', description: `Your ${section} has been saved.` });
            router.push('/profile');

        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
    if (userLoading || loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }
    
    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit' : 'Add'} {section.charAt(0).toUpperCase() + section.slice(1)}</CardTitle>
                        <CardDescription>Fill in the details below and save your changes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ProfileSectionForm 
                            currentSection={section}
                            editingItem={editingItem}
                            onFormSubmit={handleFormSubmit}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

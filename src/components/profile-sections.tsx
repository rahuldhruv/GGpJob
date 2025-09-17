

"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Education, Project, Employment, Language } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, BookOpen, Briefcase, Lightbulb, Languages, LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ProfileSectionForm } from './profile-section-form';
import { useIsMobile } from '@/hooks/use-mobile';


type Section = 'education' | 'employment' | 'projects' | 'languages';
type ProfileData = {
    education: Education[],
    employment: Employment[],
    projects: Project[],
    languages: Language[]
};

interface ProfileSectionsProps {
    userId: number;
    isEditable?: boolean;
}

export function ProfileSections({ userId, isEditable = false }: ProfileSectionsProps) {
    const [data, setData] = useState<ProfileData>({ education: [], employment: [], projects: [], languages: [] });
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const isMobile = useIsMobile();


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}/profile`);
            const fetchedData = await res.json();
            setData(fetchedData);
        } catch (error) {
            console.error("Failed to fetch profile sections", error);
            toast({ title: "Error", description: "Could not fetch profile details." });
        } finally {
            setLoading(false);
        }
    }, [userId, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (section: Section, item: any | null = null) => {
        if (isMobile) {
            const basePath = `/profile/${section}`;
            if (item) {
                router.push(`${basePath}/edit/${item.id}`);
            } else {
                router.push(`${basePath}/add`);
            }
        } else {
            setCurrentSection(section);
            setEditingItem(item);
            setIsFormOpen(true);
        }
    };
    
    const handleFormSubmit = async (values: any) => {
        if (!currentSection) return;

        const isEditing = !!editingItem;
        const url = `/api/users/${userId}/profile?section=${currentSection}`;
        const method = isEditing ? 'PUT' : 'POST';

        let bodyData = { ...values };
        if (currentSection === 'employment' && values.isCurrent) {
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
            
            toast({ title: 'Success', description: `Your ${currentSection} has been saved.` });
            await fetchData();
            setIsFormOpen(false);

        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
     const handleDelete = async (section: Section, id: number) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const response = await fetch(`/api/users/${userId}/profile?section=${section}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete item');
            }
            
            toast({ title: 'Success', description: 'Item deleted.' });
            await fetchData();

        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'Present';
        const [year, month] = dateStr.split('-');
        return format(new Date(Number(year), Number(month) - 1), 'MMM yyyy');
    }

    if(loading) return <div>Loading profile...</div>

    return (
       <>
         <Accordion type="multiple" className="w-full space-y-6" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']}>
                {/* Employment Section */}
                <AccordionItem value="item-1">
                     <Card>
                        <AccordionTrigger className="p-6">
                             <div className="flex items-center gap-4">
                                <Briefcase className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Employment History</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.employment.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('employment', item)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('employment', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm">{item.company} · {item.employmentType}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)} · {item.location}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                             {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('employment')}>
                                    <PlusCircle className="mr-2" /> Add Employment
                                </Button>
                             )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                {/* Education Section */}
                 <AccordionItem value="item-2">
                    <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-4">
                                <BookOpen className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Education</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.education.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('education', item)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('education', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        )}
                                        <h3 className="font-semibold">{item.institution}</h3>
                                        <p className="text-sm">{item.degree}, {item.fieldOfStudy}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                             {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('education')}>
                                    <PlusCircle className="mr-2" /> Add Education
                                </Button>
                             )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                 {/* Projects Section */}
                <AccordionItem value="item-3">
                     <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-4">
                                <Lightbulb className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Projects</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.projects.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('projects', item)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('projects', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                           <h3 className="font-semibold">{item.name}</h3>
                                           {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-4 w-4 text-primary hover:underline"/></a>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                            {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('projects')}>
                                    <PlusCircle className="mr-2" /> Add Project
                                </Button>
                            )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                 {/* Languages Section */}
                <AccordionItem value="item-4">
                     <Card>
                        <AccordionTrigger className="p-6">
                             <div className="flex items-center gap-4">
                                <Languages className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Languages</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                           <div className="space-y-4">
                                {data.languages.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('languages', item)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('languages', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                        <h3 className="font-semibold">{item.language}</h3>
                                        <p className="text-sm text-muted-foreground">{item.proficiency}</p>
                                    </div>
                                ))}
                           </div>
                           {isEditable && (
                            <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('languages')}>
                                <PlusCircle className="mr-2" /> Add Language
                            </Button>
                           )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
        
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Add'} {currentSection}</DialogTitle>
                        <DialogDescription>
                            Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <ProfileSectionForm 
                        currentSection={currentSection}
                        editingItem={editingItem}
                        onFormSubmit={handleFormSubmit}
                    />
                </DialogContent>
            </Dialog>
       </>
    )
}

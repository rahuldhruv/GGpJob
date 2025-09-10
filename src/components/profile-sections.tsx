
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Education, Project, Employment, Language } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, LoaderCircle, BookOpen, Briefcase, Lightbulb, Languages, Calendar, LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

type Section = 'education' | 'employment' | 'projects' | 'languages';
type ProfileData = {
    education: Education[],
    employment: Employment[],
    projects: Project[],
    languages: Language[]
};

interface ProfileSectionsProps {
    userId: number;
}

const educationSchema = z.object({
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().min(1, "Degree is required"),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
});

const employmentSchema = z.object({
    company: z.string().min(1, "Company is required"),
    title: z.string().min(1, "Title is required"),
    employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
});

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

const languageSchema = z.object({
    language: z.string().min(1, "Language is required"),
    proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Native']),
});

const schemas = {
    education: educationSchema,
    employment: employmentSchema,
    projects: projectSchema,
    languages: languageSchema,
};

type FormData = z.infer<typeof educationSchema> | z.infer<typeof employmentSchema> | z.infer<typeof projectSchema> | z.infer<typeof languageSchema>;


export function ProfileSections({ userId }: ProfileSectionsProps) {
    const [data, setData] = useState<ProfileData>({ education: [], employment: [], projects: [], languages: [] });
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const { toast } = useToast();

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
        setCurrentSection(section);
        setEditingItem(item);
        setIsFormOpen(true);
    };
    
    const handleFormSubmit = async (values: FormData) => {
        if (!currentSection) return;
        const isEditing = !!editingItem;
        const url = `/api/users/${userId}/profile?section=${currentSection}`;
        const method = isEditing ? 'PUT' : 'POST';
        const body = JSON.stringify(isEditing ? { ...values, id: editingItem.id } : values);

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


    const renderForm = () => {
        if (!currentSection) return null;
        
        const form = useForm({
            resolver: zodResolver(schemas[currentSection]),
            defaultValues: editingItem || {},
        });
        
        const { isSubmitting } = form.formState;

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                    {currentSection === 'education' && (
                        <>
                           <FormField control={form.control} name="institution" render={({ field }) => ( <FormItem> <FormLabel>Institution</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           <FormField control={form.control} name="degree" render={({ field }) => ( <FormItem> <FormLabel>Degree</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           <FormField control={form.control} name="fieldOfStudy" render={({ field }) => ( <FormItem> <FormLabel>Field of Study</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="startDate" render={({ field }) => ( <FormItem> <FormLabel>Start Date</FormLabel> <FormControl><Input type="month" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                             <FormField control={form.control} name="endDate" render={({ field }) => ( <FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="month" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           </div>
                           <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        </>
                    )}
                    {currentSection === 'employment' && (
                         <>
                           <FormField control={form.control} name="company" render={({ field }) => ( <FormItem> <FormLabel>Company</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           <FormField control={form.control} name="employmentType" render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Employment Type</FormLabel>
                                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                                       <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                       <SelectContent>
                                           <SelectItem value="Full-time">Full-time</SelectItem>
                                           <SelectItem value="Part-time">Part-time</SelectItem>
                                           <SelectItem value="Contract">Contract</SelectItem>
                                           <SelectItem value="Internship">Internship</SelectItem>
                                       </SelectContent>
                                   </Select>
                                   <FormMessage />
                               </FormItem>
                           )}/>
                           <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => ( <FormItem> <FormLabel>Start Date</FormLabel> <FormControl><Input type="month" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="endDate" render={({ field }) => ( <FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="month" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                           </div>
                           <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        </>
                    )}
                    {currentSection === 'projects' && (
                         <>
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Project Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="url" render={({ field }) => ( <FormItem> <FormLabel>Project URL</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="startDate" render={({ field }) => ( <FormItem> <FormLabel>Start Date</FormLabel> <FormControl><Input type="month" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="endDate" render={({ field }) => ( <FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="month" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            </div>
                            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                         </>
                    )}
                    {currentSection === 'languages' && (
                        <>
                            <FormField control={form.control} name="language" render={({ field }) => ( <FormItem> <FormLabel>Language</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="proficiency" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proficiency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select proficiency" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                            <SelectItem value="Native">Native</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
                           Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        );
    };
    
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'Present';
        const [year, month] = dateStr.split('-');
        return format(new Date(Number(year), Number(month) - 1), 'MMM yyyy');
    }

    if(loading) return <div>Loading profile...</div>

    return (
       <>
         <Accordion type="multiple" collapsible className="w-full space-y-6" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']}>
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
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('employment', item)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('employment', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm">{item.company} · {item.employmentType}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)} · {item.location}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('employment')}>
                                <PlusCircle className="mr-2" /> Add Employment
                            </Button>
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
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('education', item)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('education', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        <h3 className="font-semibold">{item.institution}</h3>
                                        <p className="text-sm">{item.degree}, {item.fieldOfStudy}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('education')}>
                                <PlusCircle className="mr-2" /> Add Education
                            </Button>
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
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('projects', item)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('projects', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                           <h3 className="font-semibold">{item.name}</h3>
                                           {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-4 w-4 text-primary hover:underline"/></a>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('projects')}>
                                <PlusCircle className="mr-2" /> Add Project
                            </Button>
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
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('languages', item)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('languages', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        <h3 className="font-semibold">{item.language}</h3>
                                        <p className="text-sm text-muted-foreground">{item.proficiency}</p>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('languages')}>
                                <PlusCircle className="mr-2" /> Add Language
                            </Button>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
        
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Add'} {currentSection}</DialogTitle>
                        <DialogDescription>
                            Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    {renderForm()}
                </DialogContent>
            </Dialog>
       </>
    )
}

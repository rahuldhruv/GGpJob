
"use client"

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

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
    isCurrent: z.boolean().default(false).optional(),
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

const defaultValues = {
    education: { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' },
    employment: { company: '', title: '', employmentType: 'Full-time' as const, location: '', startDate: '', endDate: '', description: '', isCurrent: false },
    projects: { name: '', description: '', url: '', startDate: '', endDate: '' },
    languages: { language: '', proficiency: 'Beginner' as const }
};

type FormData = z.infer<typeof educationSchema> | z.infer<typeof employmentSchema> | z.infer<typeof projectSchema> | z.infer<typeof languageSchema>;
type Section = 'education' | 'employment' | 'projects' | 'languages';

interface ProfileSectionFormProps {
  currentSection: Section | null;
  editingItem: any | null;
  onFormSubmit: (values: FormData) => void;
  onCancel?: () => void;
}

export const ProfileSectionForm = ({
  currentSection,
  editingItem,
  onFormSubmit,
  onCancel
}: ProfileSectionFormProps) => {
    if (!currentSection) return null;

    const form = useForm({
        resolver: zodResolver(schemas[currentSection]),
        defaultValues: editingItem 
            ? { ...editingItem, isCurrent: !editingItem.endDate }
            : defaultValues[currentSection],
    });

    const { watch, setValue, formState: { isSubmitting } } = form;

    const isCurrent = currentSection === 'employment' ? watch('isCurrent') : false;

    useEffect(() => {
        if (isCurrent) {
            setValue('endDate', '');
        }
    }, [isCurrent, setValue]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
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
                        <FormField control={form.control} name="endDate" render={({ field }) => ( <FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="month" {...field} disabled={isCurrent} /></FormControl> <FormMessage /> </FormItem> )}/>
                       </div>
                        <FormField control={form.control} name="isCurrent" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>I currently work here</FormLabel>
                                </div>
                            </FormItem>
                        )}/>
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
                    {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
                    <Button type="submit" disabled={isSubmitting}>
                       {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
                       Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
};

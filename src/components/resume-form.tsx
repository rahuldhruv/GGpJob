
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, FileText, Upload, CheckCircle, Download } from "lucide-react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";

const formSchema = z.object({
  resume: z.any().refine(files => files?.length > 0, "Please select a file to upload."),
});

type ResumeFormValues = z.infer<typeof formSchema>;

interface ResumeFormProps {
  user: User;
}

export function ResumeForm({ user: initialUser }: ResumeFormProps) {
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(formSchema),
  });

  const { isSubmitting, isValid, reset } = form;

  const onSubmit = async (data: ResumeFormValues) => {
    if (!user) return;
    const file = data.resume[0];
    if (!file) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }
    
    // This is a placeholder for actual file upload logic.
    // In a real app, you would upload the file to a storage service (e.g., Firebase Storage)
    // and then save the URL to the user's profile.
    // For this demo, we'll simulate this by creating a fake path.
    const resumePath = `/resumes/user-${user.id}-${file.name}`;
    
    try {
      const response = await fetch(`/api/users/${user.id}/resume`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumePath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resume");
      }
      
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });

      toast({
        title: "Resume Updated!",
        description: "Your new resume has been successfully saved.",
      });

      // Clear the file input
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      reset();
      setSelectedFileName(null);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  const currentResume = user?.resume;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (files: FileList | null) => void) => {
    const files = e.target.files;
    fieldChange(files);
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
    } else {
      setSelectedFileName(null);
    }
  }

  return (
    <div className="space-y-4">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentResume && !selectedFileName ? (
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{currentResume.split('/').pop()}</span>
                </div>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href={currentResume} target="_blank" download>
                        <Download className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            ) : !selectedFileName ? (
            <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
            ): null}
            
            {selectedFileName && (
                <div className="flex items-center justify-between p-3 border rounded-md border-primary/50 bg-primary/10">
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <CheckCircle className="h-4 w-4" />
                    <span>{selectedFileName}</span>
                    </div>
                </div>
            )}

            <FormField
            control={form.control}
            name="resume"
            render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                <FormLabel className="sr-only">Resume</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Button asChild variant="outline" className="w-full">
                        <label htmlFor="resume-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4"/>
                            {currentResume ? 'Upload New Resume' : 'Upload Resume'}
                        </label>
                        </Button>
                        <Input 
                            id="resume-upload"
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => handleFileChange(e, onChange)}
                            onBlur={onBlur}
                            name={name}
                            ref={(e) => {
                                ref(e);
                                fileInputRef.current = e;
                            }}
                        />
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Save Resume
            </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}

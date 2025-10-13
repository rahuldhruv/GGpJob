
"use client";

import { useState, useEffect } from "react";
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
import { LoaderCircle, FileText, ExternalLink, UploadCloud, Paperclip } from "lucide-react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";
import { Progress } from "./ui/progress";

const formSchema = z.object({
  resumeFile: z.instanceof(File).optional(),
});

type ResumeFormValues = z.infer<typeof formSchema>;

interface ResumeFormProps {
  user: User;
}

export function ResumeForm({ user: initialUser }: ResumeFormProps) {
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(formSchema),
  });

  const { formState: { isSubmitting }, reset, watch, setValue } = form;
  const selectedFile = watch("resumeFile");
  
  useEffect(() => {
    reset();
  }, [user, reset]);


  const onSubmit = async (data: ResumeFormValues) => {
    if (!user) return;
    if (!data.resumeFile) {
        toast({ title: "No file selected", description: "Please select a resume file to upload.", variant: "destructive" });
        return;
    }
    
    // If a resume already exists, delete it before uploading a new one.
    if (user.resumeUrl) {
      try {
        const oldResumeRef = ref(storage, user.resumeUrl);
        await deleteObject(oldResumeRef);
      } catch (error: any) {
        // If deletion fails (e.g., file not found), log it but don't block the upload.
        console.error("Failed to delete old resume, it might not exist.", error);
      }
    }


    const file = data.resumeFile;
    const storageRef = ref(storage, `resumes/${user.id}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
        },
        (error) => {
            console.error("Upload failed:", error);
            toast({ title: "Upload Failed", description: "Your resume could not be uploaded. Please try again.", variant: "destructive" });
            setUploadProgress(null);
        },
        async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            try {
                const response = await fetch(`/api/users/${user.id}/resume`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resumeUrl: downloadURL }),
                });

                if (!response.ok) throw new Error("Failed to save resume URL.");
                
                const updatedData = await response.json();
                setUser({ ...user, resumeUrl: updatedData.resumeUrl });

                toast({ title: "Resume Uploaded!", description: "Your new resume has been successfully saved." });
            } catch (error) {
                toast({ title: "Error", description: "Failed to save your new resume. Please try again.", variant: "destructive" });
            } finally {
                setUploadProgress(null);
                reset();
            }
        }
    );
  };
  
  const currentResumeUrl = user?.resumeUrl;

  return (
    <div className="space-y-4">
        {currentResumeUrl && (
             <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Current Resume</span>
                </div>
                <Button asChild variant="ghost" size="sm">
                    <Link href={currentResumeUrl} target="_blank" download>
                        View Resume <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        )}
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
            control={form.control}
            name="resumeFile"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Upload New Resume</FormLabel>
                <FormControl>
                    <div className="relative">
                       <UploadCloud className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="pl-8"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setValue("resumeFile", file);
                                }
                            }}
                        />
                    </div>
                </FormControl>
                 <FormMessage />
                </FormItem>
            )}
            />
            
            {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                    <Paperclip className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                </div>
            )}


            {uploadProgress !== null && (
                <div className="space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
            )}

            <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting || uploadProgress !== null}>
                {(isSubmitting || uploadProgress !== null) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Upload and Save
            </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}

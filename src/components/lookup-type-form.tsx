
"use client";

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
import { LoaderCircle } from "lucide-react";
import type { JobType, WorkplaceType, ExperienceLevel } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

interface LookupTypeFormProps {
  item: JobType | WorkplaceType | ExperienceLevel | null;
  typeName: string;
  apiPath: string;
  onSuccess: () => void;
}

export function LookupTypeForm({ item, typeName, apiPath, onSuccess }: LookupTypeFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    try {
      const url = item ? `${apiPath}/${item.id}` : apiPath;
      const method = item ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${item ? 'update' : 'create'} ${typeName}`);
      }
      
      toast({
        title: "Success!",
        description: `${typeName} successfully ${item ? 'updated' : 'created'}.`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{typeName} Name</FormLabel>
              <FormControl>
                <Input placeholder={`e.g. Full-time`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {item ? "Save Changes" : `Create ${typeName}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}

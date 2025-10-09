
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
import type { Location } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters long."),
  country: z.string().min(2, "Country name must be at least 2 characters long."),
});

type LocationFormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  location: Location | null;
  onSuccess: () => void;
}

export function LocationForm({ location, onSuccess }: LocationFormProps) {
  const { toast } = useToast();
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: location?.name || "",
      country: location?.country || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: LocationFormValues) => {
    try {
      const url = location ? `/api/locations/${location.id}` : "/api/locations";
      const method = location ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${location ? 'update' : 'create'} location`);
      }
      
      toast({
        title: "Success!",
        description: `Location successfully ${location ? 'updated' : 'created'}.`,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. New York" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="e.g. United States" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {location ? "Save Changes" : "Create Location"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

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
import type { Domain } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Domain name must be at least 2 characters long."),
});

type DomainFormValues = z.infer<typeof formSchema>;

interface DomainFormProps {
  domain: Domain | null;
  onSuccess: () => void;
}

export function DomainForm({ domain, onSuccess }: DomainFormProps) {
  const { toast } = useToast();
  const form = useForm<DomainFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: domain?.name || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: DomainFormValues) => {
    try {
      const url = domain ? `/api/domains/${domain.id}` : "/api/domains";
      const method = domain ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${domain ? 'update' : 'create'} domain`);
      }
      
      toast({
        title: "Success!",
        description: `Domain successfully ${domain ? 'updated' : 'created'}.`,
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
              <FormLabel>Domain Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Software Engineering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {domain ? "Save Changes" : "Create Domain"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

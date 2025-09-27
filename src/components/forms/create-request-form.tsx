"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { clientApi } from "@/trpc/react";

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

interface CreateRequestFormProps {
  latitude: number;
  longitude: number;
  onSuccess?: () => void;
}

export function CreateRequestForm({ latitude, longitude, onSuccess }: CreateRequestFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createRequestMutation = clientApi.request.create.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createRequestMutation.mutateAsync({
        ...values,
        latitude,
        longitude,
      });
      toast.success("Request created successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create request. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Need help with a flat tire" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide any additional details here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createRequestMutation.isPending}>
          {createRequestMutation.isPending ? "Creating..." : "Create Request"}
        </Button>
      </form>
    </Form>
  );
}

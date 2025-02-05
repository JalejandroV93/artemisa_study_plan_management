"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const subjectFormSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  vision: z.string().optional(),
  mission: z.string().optional(),
  generalObjective: z.string().optional(),
  specificObjectives: z.string().optional(),
  didactics: z.string().optional(),
  crossCuttingProjects: z.string().optional(),
});

export default function NewSubjectPage() {
  const form = useForm<z.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      vision: "",
      mission: "",
      generalObjective: "",
      specificObjectives: "",
      didactics: "",
      crossCuttingProjects: "",
    },
  });

  function onSubmit(values: z.infer<typeof subjectFormSchema>) {
    console.log(values);
  }

  return (
    <div className="container mx-auto py-8">
      <Link href="/subjects" className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Subjects
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">New Subject</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subject name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vision (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter vision statement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter mission statement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generalObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Objective (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter general objective" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specificObjectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Objectives (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter specific objectives (one per line)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter each objective on a new line
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="didactics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Didactics (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter didactics information" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crossCuttingProjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cross-cutting Projects (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter cross-cutting projects" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Link href="/subjects">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit">Create Subject</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
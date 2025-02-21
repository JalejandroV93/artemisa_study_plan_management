// src/components/users/UserForm.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@prisma/client";
import { useToast } from "@/hooks/use-toast"

const createUserSchema = z.object({
    username: z.string().min(3).max(50),
    document: z.string().min(1),  // Assuming 'document' can be a variety of identifiers. Adjust as needed.
    fullName: z.string().min(1),
    email: z.string().email().optional(),
    password: z.string().min(8), // Enforce minimum password length
    role: z.enum(['ADMIN', 'TEACHER']),
});

// We are re-using it in order to infer the TS type
const updateUserSchema = createUserSchema.omit({password: true});

type UserFormValues = z.infer<typeof createUserSchema>;
type UserFormUpdateValues = z.infer<typeof updateUserSchema>;

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserForm({ user, onClose, onSuccess }: UserFormProps) {

    const { toast } = useToast();

    const form = useForm<UserFormValues | UserFormUpdateValues>({
        resolver: zodResolver(user ? updateUserSchema : createUserSchema), // Use different schemas
        defaultValues: user
        ? {
            username: user.username,
            document: user.document,
            fullName: user.fullName,
            email: user.email ?? "",
            role: user.role,
            }
        : {
            username: "",
            document: "",
            fullName: "",
            email: "",
            password: "",
            role: "TEACHER",
        },
    });

    async function onSubmit(values: UserFormValues | UserFormUpdateValues) {
        try {
            const response = await fetch(user ? `/api/v1/users/${user.id}` : '/api/v1/users', {
                method: user ? 'PUT' : 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400 && errorData.error) {
                    // Display Zod validation errors using toast
                  Object.keys(errorData.error).forEach((field) => {
                    const message = errorData.error[field]?.message || "Error";
                    toast({
                        description: `Error en ${field}: ${message}`,
                        variant: "destructive",
                      });
                    });
                  } else{
                    throw new Error(errorData.error || (user ? "Failed to update user" : "Failed to create user"));
                }
            } else{
                onSuccess();
                onClose();
                toast({
                    description: user ? 'User updated successfully' : 'User created successfully',
                  });
            }


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({
                description: error.message,
                variant: "destructive",
              });
        }
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document</FormLabel>
              <FormControl>
                <Input placeholder="document" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!user && ( // Conditionally render the password field
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input placeholder="Password" {...field} type="password" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{user ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}
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
    resolver: zodResolver(user ? updateUserSchema : createUserSchema),
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
          description: user ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
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
        <FormLabel>Nombre de Usuario</FormLabel>
        <FormControl>
        <Input placeholder="Nombre de usuario" {...field} />
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
        <FormLabel>Documento</FormLabel>
        <FormControl>
        <Input placeholder="Documento" {...field} />
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
        <FormLabel>Nombre Completo</FormLabel>
        <FormControl>
        <Input placeholder="Nombre completo" {...field} />
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
        <FormLabel>Correo Electrónico</FormLabel>
        <FormControl>
        <Input placeholder="Correo electrónico" {...field} type="email" />
        </FormControl>
        <FormMessage />
      </FormItem>
      )}
    />
    {!user && (
      <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
        <FormLabel>Contraseña</FormLabel>
        <FormControl>
          <Input placeholder="Contraseña" {...field} type="password" />
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
        <FormLabel>Rol</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
          <SelectValue placeholder="Seleccione un rol" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="ADMIN">Administrador</SelectItem>
          <SelectItem value="TEACHER">Profesor</SelectItem>
        </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
      )}
    />
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={onClose}>
      Cancelar
      </Button>
      <Button type="submit">{user ? "Actualizar" : "Crear"}</Button>
    </div>
    </form>
  </Form>
  );
}

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Form, FormField, FormItem, FormControl, FormMessage } from "../ui/form";
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useMutation } from "@tanstack/react-query";
import { forgetPassword } from "@/service/UserService";
import { toast } from "sonner";

interface ForgetPasswordProps {
  isDialogOpen: boolean;
  setisDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define validation schema with Zod
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" })
});

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ isDialogOpen, setisDialogOpen }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" }
  });

  const { mutateAsync } = useMutation({
    mutationKey: ['ForgetPassword'],
    mutationFn: forgetPassword
  })

  const onSubmit = (data: { email: string }) => {
    setisDialogOpen(false);
    toast.promise(mutateAsync(data), {
      loading: "Processing...",
      success: data => data.data?.message,
      error: data => data.data?.message
    })
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setisDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forget Password?</DialogTitle>
          <DialogDescription>
            Enter your email, and a temporary password will be sent to your email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField 
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter your email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ForgetPassword;

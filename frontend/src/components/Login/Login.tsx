import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginFormSchema } from "@/schema";
import { login } from "@/service/AuthService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ForgetPassword from "../ForgetPassword/ForgetPassword";
import SignUp from "../SignUp/SignUp";

const Login = () => {
  const { id } = useParams();
  const [isDialogOpen, setisDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      userid: "",
      password: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (data) => {
      if (data.status === 200) {
        queryClient.refetchQueries({ queryKey: ["getuser"] });
        if (id) {
          navigate(`/interview/${id}`);
        } else {
          data.data?.user?.role === "HR" ? navigate("/hr/dashboard") : navigate("/");
        }
      }
    },
  });

  const onSubmit = async (data: any) => {
    toast.promise(mutateAsync(data), {
      loading: "Validating your credentials...",
      success: (res) => `Welcome back, ${res.data.user.username}!`,
      error: (error) => error?.response?.data?.message || "Username or Password Incorrect",
    });
  };

  return (
    <div className="min-h-screen w-full grid md:grid-cols-2">
      <div className="flex flex-col items-center h-full px-4 sm:px-0">
        <div className="flex items-center mt-6 space-x-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="25" viewBox="0 0 24 22" fill="none"><path d="M4.3871 18.3003V3.6997H7.48387L12.0645 9.11712L16.7742 3.6997V0H1.09677C0.438603 0.232694 0.208106 0.502832 0 1.18919V17.045C0.241954 17.7703 0.509843 18.0102 1.09677 18.3003H4.3871Z" fill="#0183FF"></path><path d="M8 9.31532V22H22.6452C23.414 21.8499 23.705 21.5822 24 20.8108V4.95495C23.7856 4.32159 23.5816 4.02257 22.9032 3.6997H19.8065V18.3003H16.1935V9.31532L12.4516 13.8739H11.8065L8 9.31532Z" fill="#464646"></path></svg>
          <h2 className="font-semibold">MightyRecruit</h2>
        </div>
        <div className="my-auto w-full flex flex-col items-center">
          <div className="text-center mt-auto mb-6">
            <h3 className="text-2xl font-semibold">Welcome Back!</h3>
            <p className="text-gray-600 mt-2">Welcome Back, Please enter Your details</p>
          </div>
          
          <div className="w-full max-w-md">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger className="cursor-pointer" value="signin">Sign In</TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="userid"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <Input 
                                  placeholder="Username or email" 
                                  className="h-12 pl-10 pr-4 border-l-2" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-4" />
                                <Input 
                                  type="password"
                                  placeholder="Enter your password" 
                                  className="h-12 pl-10 pr-4 border-l-2" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setisDialogOpen(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isPending}>
                        Sign In
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <SignUp />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Forgot Password Dialog */}
        <ForgetPassword isDialogOpen={isDialogOpen} setisDialogOpen={setisDialogOpen} />
      </div>

      <div className="hidden md:flex relative h-screen">
        <img
          src="https://images.pexels.com/photos/3746957/pexels-photo-3746957.jpeg?auto=compress&cs=tinysrgb&w=600"
          className="h-full w-full object-cover"
          alt="Recruitment illustration"
        />
      </div>
    </div>
  );
};

export default Login;
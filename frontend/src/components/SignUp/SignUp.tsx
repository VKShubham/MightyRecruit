import { SignupFormSchema } from '@/schema'
import { login, signupCandidate } from '@/service/AuthService'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LockIcon, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import UsernameCheck from '../custom/UsernameCheck'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

const SignUp = () => {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(SignupFormSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })

    const { mutate: LoginMutate } = useMutation({
        mutationKey: ['Login'],
        mutationFn: login,
        onSuccess: (data) => {
          if (data.status === 200) {
            queryClient.refetchQueries({ queryKey: ["getuser"] });
              data.data?.user?.role === "HR" ? navigate("/hr/dashboard") : navigate("/");
          }
          toast.dismiss();
          toast.success('Registerd Successfully');
        },
        onError: () => {
            toast.dismiss();
            toast.success('Registerd Successfully');
            toast.info('Auto Login Failed');
        }
    })

    const { mutate } = useMutation({
        mutationKey: ['RegisterCandidate'],
        mutationFn: signupCandidate,
        onSuccess: () => {
            LoginMutate({
                userid: form.watch('username'),
                password: form.watch('password'),
            })
            form.reset();
        },
        onError: (err: any) => {
            toast.dismiss();
            toast.error(err.response?.data?.message)
        },
    })

    const onSubmit = (data: {
        username: string;
        email: string;
        password: string;
    }) => {
        toast.loading('Registering a user...')
        mutate(data);
    }

  return (
    <div>
        <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className='relative'>
                    <User className="absolute left-3 top-6 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <UsernameCheck 
                      name='username'
                      control={form.control}
                      classname='h-12 pl-10 pr-4 border-l-2'
                      disableLabel
                    />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <Input 
                              placeholder="Enter your email" 
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
                            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-4" />
                            <Input 
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

                    <Button type="submit" className="w-full h-12 text-base font-semibold">
                      Sign Up
                    </Button>
                  </div>
                </form>
              </Form>
    </div>
  )
}

export default SignUp
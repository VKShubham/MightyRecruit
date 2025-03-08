import { useUser } from "@/app/store"
import { createInterviewer, getAllInterviewers } from "@/service/InterViewerService"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper } from '@tanstack/react-table'
import { AxiosError } from "axios"
import { Loader2, Mail, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import CustomTable, { FilterConfig } from "../custom/CustomTable"
import InfoComponent from "../custom/InfoComponet"
import UsernameCheck from "../custom/UsernameCheck"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"

const ManageInterViewers = () => {
    type Interviewer = {
        created_at: string;
        email: string;
        id: string;
        password: string;
        role: string;
        status: string;
        username: string;
        updated_at: string;
    }

    const removeuser = useUser(state => state.removeUser);
    const navigate = useNavigate();

    const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
    const [isDialogOpen, setisDialogOpen] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['getallInterviewers'],
        queryFn: getAllInterviewers
    });

    if((error as AxiosError)?.status === 403) {
          removeuser();
          navigate('/login');
        }

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['createIntervewer'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getallInterviewers'] })
        },
        onError: (data: any) => {
            if(data.response.status === 403) {
                window.location.href = '/login';
                removeuser();
            }
        },
        onSettled: () => {
            form.reset();
        },
        mutationFn: ({ email, username }: { email: string; username: string }) => 
            createInterviewer(email, username),
    })

    const schema = z.object({
        email: z.string().email('Enter Valid Email'),
        username: z.string().min(2, 'Username is Required')
    })

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            username: '',
            email: ''
        }
    })

    const onSubmit = (data: z.infer<typeof schema>) => {
        setisDialogOpen(false);
        toast.promise(mutateAsync(data), {
            loading: 'Interview Adding...',
            success: 'Successfully Added',
            error: data => data.response?.data?.message
        });
    }

    // Update interviewers when data changes
    useEffect(() => {
        if (data) {
            setInterviewers(data.data?.data);
        }
    }, [data]);

    const columnHelper = createColumnHelper<Interviewer>()

    const columns = [
        columnHelper.accessor('username', {
            header: () => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">Username</span>
                </div>
            ),
            cell: info => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{info.getValue()}</span>
                </div>
            ),
            enableSorting: false
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: info => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{info.getValue()}</span>
                </div>
            ),
            enableSorting: false
        }),
    ]

    const FilterConfig: FilterConfig[] = [
        {
          id: 'username',
          type: 'text',
          label: 'Username'
        },
      ]

      if(error) return <InfoComponent title="Something went wrong!" message="please try after some time" type="error"/>
      if(!interviewers) return <InfoComponent title="No Interviewers Found" type="warning" message="at a time we don't have any interviewers"/>

    return (
        <div className="max-w-screen">
            <div>
                <CustomTable 
                    data={interviewers}
                    columns={columns}
                    title="Manage Interviewer"
                    isLoading={isLoading}
                    filterConfig={FilterConfig}
                    onAddClick={() => setisDialogOpen(true)}
                    showAddButton
                />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setisDialogOpen}>
                <DialogContent className="sm:max-w-md p-0" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader className="pb-0 px-2">
                        <DialogTitle className="pt-4">Add New Interviewer</DialogTitle>
                    </DialogHeader>
                    <Separator className="my-0 py-0"/>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="px-3">
                            <UsernameCheck 
                                name="username"
                                control={form.control}
                            />
                            </div>
                            <FormField 
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="px-3">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Separator className="my-0 py-0"/>
                            <DialogFooter className="p-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    disabled={isPending} 
                                    onClick={() => {
                                        setisDialogOpen(false);
                                        form.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? <Loader2 className="animate-spin"/> : "Add Interviewer"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ManageInterViewers
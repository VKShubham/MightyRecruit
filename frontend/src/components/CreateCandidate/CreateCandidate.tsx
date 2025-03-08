import { createCredentialSchema, CreateCrendetail } from '@/schema'
import { createCandidate } from '@/service/UserService'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import UsernameCheck from '../custom/UsernameCheck'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'

interface CreateCandidateProps {
    dialogopen: boolean;
    setDialogOpen: (state: boolean) => void;
}

const CreateCandidate: React.FC<CreateCandidateProps> = ({
    dialogopen,
    setDialogOpen
}) => {
    const form = useForm<CreateCrendetail>({
        resolver: zodResolver(createCredentialSchema),
        defaultValues: {
            username: '',
            email: "",
            password: "" ,
            source: ""
        }
    })

    const { mutateAsync } = useMutation({
        mutationFn: createCandidate,
        mutationKey: ["CreateCandidate"]
    })

    const onsubmit = (data: CreateCrendetail) => {
        setDialogOpen(false)
        toast.promise(mutateAsync(data), {
            loading: 'Creating user...',
            success: data => data.data?.message,
            error: data => data.response?.data?.message
        })
        form.reset();
    }
  return (
        <Dialog open={dialogopen} onOpenChange={setDialogOpen}>
            <DialogContent className='p-0'>
                <DialogHeader className='pb-0 px-2'>
                    <DialogTitle className='pt-4'>Create Credential</DialogTitle>
                </DialogHeader>
                <Separator />
                <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-4">
                    <div className="space-y-3">
                        <Form {...form}>
                            <div className='mx-2'>
                            <UsernameCheck 
                                name='username'
                                control={form.control}
                            />
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className='mx-2'>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className='mx-2'>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Enter password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="source"
                                render={({ field }) => (
                                    <FormItem className='mx-2'>
                                        <FormLabel>Source</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter source" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Separator className='my-0 py-0'/>
                            <DialogFooter className='p-2'>
                                <Button type='button' onClick={() => setDialogOpen(false)} variant="outline">Cancel</Button>
                                <Button type="submit">Submit</Button>
                            </DialogFooter>
                        </Form>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
  )
}

export default CreateCandidate
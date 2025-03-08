import { ChangePasswordSchema, ChangePassword as TypeChangePassword } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { changePassword } from '@/service/UserService'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ChangePasswordProps {
    dialogopen: boolean;
    setDialogOpen: (state: boolean) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
    dialogopen,
    setDialogOpen
}) => {
    const form = useForm<TypeChangePassword>({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: {
           oldpassword: "",
           newpassword: ""
        }
    })

    const { mutateAsync } = useMutation({
        mutationFn: changePassword,
        mutationKey: ["ChangePassword"]
    })

    const onsubmit = (data: TypeChangePassword) => {
        setDialogOpen(false)
        toast.promise(mutateAsync(data), {
            loading: 'Updating Password...',
            success: data => data.data?.message,
            error: data => data.response?.data?.message || 'Failed to Update'
        })
        form.reset();
    }
    
  return (
        <Dialog open={dialogopen} onOpenChange={setDialogOpen}>
            <DialogContent className='p-0 text-sm'>
                <DialogHeader className='pb-0 px-2'>
                    <DialogTitle className='pt-4'>Change Password</DialogTitle>
                </DialogHeader>
                <Separator />
                <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-4">
                    <div className="space-y-3">
                        <Form {...form}>
                            <FormField
                                control={form.control}
                                name="oldpassword"
                                render={({ field }) => (
                                    <FormItem className='mx-2'>
                                        <FormLabel>Old Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your old password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="newpassword"
                                render={({ field }) => (
                                    <FormItem className='mx-2'>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Enter new password" {...field} />
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

export default ChangePassword
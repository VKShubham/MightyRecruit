import { Badge as TypeBadge } from "@/@types/badge";
import { CreateBadge, createBadgeSchema } from "@/schema";
import { createBadge, getAllbadges, UpdateBadge } from "@/service/BadgeServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Badge from "../custom/Badge";
import CustomTable from "../custom/CustomTable";
import InfoComponent from "../custom/InfoComponet";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";

const colorOptions = [
    { label: 'Red', value: '#FF0000' },
    { label: 'Orange', value: '#FFA500' },
    { label: 'Yellow', value: '#FFFF00' },
    { label: 'Green', value: '#008000' },
    { label: 'Blue', value: '#0000FF' },
    { label: 'Purple', value: '#800080' },
    { label: 'Pink', value: '#FFC0CB' },
    { label: 'Brown', value: '#A52A2A' },
    { label: 'Black', value: '#000000' },
    { label: 'White', value: '#FFFFFF' }
];

interface TableData extends TypeBadge {
    preview: any;
    actions: any;
}

const ManageBadges = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<TypeBadge | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['getAllBadges'],
        queryFn: getAllbadges
    });

    const form = useForm<CreateBadge>({
        resolver: zodResolver(createBadgeSchema),
        defaultValues: {
            name: "",
            color: ""
        }
    });

    useEffect(() => {
        if (isDialogOpen && isEdit && selectedBadge) {
            form.reset({
                name: selectedBadge.name,
                color: selectedBadge.color
            });
        } else if (!isDialogOpen) {
            // Reset form when dialog closes
            form.reset({
                name: "",
                color: ""
            });
            setIsEdit(false);
            setSelectedBadge(null);
        }
    }, [isDialogOpen, isEdit, selectedBadge, form]);

    const createMutation = useMutation({
        mutationKey: ['CreateBadge'],
        mutationFn: createBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getAllBadges'] });
        }
    });

    const updateMutation = useMutation({
        mutationKey: ['UpdateBadge'],
        mutationFn: UpdateBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getAllBadges'] });
        }
    });

    const onSubmit = (data: CreateBadge) => {
        if (isEdit && selectedBadge) {
            // Update existing badge
            setIsDialogOpen(false);
            toast.promise(updateMutation.mutateAsync({ ...data, id: selectedBadge.id }), {
                loading: 'Updating badge...',
                success: response => response.data?.message || "Badge updated successfully",
                error: error => error?.response?.data?.message || "Failed to update badge"
            });
        } else {
            // Create new badge
            setIsDialogOpen(false);
            toast.promise(createMutation.mutateAsync(data), {
                loading: 'Creating badge...',
                success: response => response.data?.message || "Badge created successfully",
                error: error => error?.response?.data?.message || "Failed to create badge"
            });
        }
    };

    const handleEditBadge = (badge: TypeBadge) => {
        setSelectedBadge(badge);
        setIsEdit(true);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setIsEdit(false);
        setSelectedBadge(null);
        setIsDialogOpen(true);
    };

    const badges: TypeBadge[] = data?.data?.data || [];
    
    const columnHelper = createColumnHelper<TableData>();

    const columns = [
        columnHelper.accessor("preview", {
            header: "Badge",
            cell: ({ row }) => (
                <Badge 
                    name={row.original.name}
                    color={row.original.color}
                />
            )
        }),
        columnHelper.accessor("name", {
            header: "Name",
            cell: info => info.getValue()
        }),
        columnHelper.accessor("color", {
            header: "Color Code",
            cell: info => (
                <div className="flex items-center gap-2">
                    <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: info.getValue() }} 
                    />
                    {info.getValue()}
                </div>
            )
        }),
        columnHelper.accessor("created_by", {
            header: "Created By",
            cell: info => info.getValue()
        }),
        columnHelper.accessor("actions", {
            header: "Actions",
            cell: ({ row }) => {
                return (
                    <Button 
                        variant="ghost"
                        onClick={() => handleEditBadge(row.original)}
                    >
                        <Pencil className="text-green-700" />
                    </Button>
                )
            }
        }),
    ];

    if (error) return <InfoComponent type="error" title="Something went wrong" message="Please try again later" />;
    
    return (
        <div className="max-w-screen">
            <CustomTable 
                data={badges}
                columns={columns}
                title="Manage Badges"
                onAddClick={handleAddNew}
                isLoading={isLoading}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="p-0">
                    <DialogHeader className="pb-0 px-2">
                        <DialogTitle className="pt-4">{isEdit ? "Edit Badge" : "Create Badge"}</DialogTitle>
                    </DialogHeader>
                    <Separator className="my-0 py-0"/>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField 
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="px-3">
                                        <FormLabel>Badge Name</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter your badge name"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem className="px-3">
                                        <FormLabel>Choose color</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choose color" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {colorOptions.map(color => (
                                                        <SelectItem value={color.value} key={color.label}>
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-6 h-6 rounded-full" 
                                                                    style={{ backgroundColor: color.value }} 
                                                                />
                                                                <span>{color.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                        {field.value && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="text-sm">Preview:</div>
                                                <Badge 
                                                    name={form.watch("name") || "Preview"}
                                                    color={form.watch("color")}
                                                />
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <Separator className="my-0 py-0" />
                            <DialogFooter className="p-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {isEdit ? "Update" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageBadges;
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttachBadge, getAllbadges, getApplicationBadges } from '@/service/BadgeServices';
import { Button } from '../ui/button';
import Badge from './Badge';
import { Badge as TypeBadge } from '@/@types/badge';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

interface AttachBadgeDialogProps {
    isOPen: boolean;
    setOpen: (val: boolean) => void;
    application_id: string;
}

export const AttachBadgeDialog: React.FC<AttachBadgeDialogProps> = ({
    isOPen,
    setOpen,
    application_id
}) => {
    const queryClient = useQueryClient();
    // Fetch existing application badges
    const { data: existingBadgesData, isLoading: existingBadgesLoading } = useQuery({
        queryKey: ['GetApplicationBadges', application_id],
        queryFn: () => getApplicationBadges(application_id),
        enabled: !!application_id
    });

    // Fetch all available badges
    const { data: allBadgesData, isLoading: allBadgesLoading } = useQuery({
        queryKey: ['getAllBadges'],
        queryFn: () => getAllbadges(),
    });

    // Attach Badge
    const { mutateAsync:AttachBadgefn } = useMutation({
        mutationFn: AttachBadge,
        mutationKey: ['AttachBadge'],
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getApprovedApplication'], exact: false})
        }
      })

    // State to manage selected badges
    const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

    // Initialize selected badges based on existing badges
    useEffect(() => {
        if (existingBadgesData?.data?.data) {
            const existingBadgeIds = existingBadgesData.data.data.map((badge: {badge_id: string}) => badge.badge_id);
            setSelectedBadges(existingBadgeIds);
        }
    }, [existingBadgesData]);

    // Handle badge selection/deselection
    const handleBadgeToggle = (badgeId: string) => {
        setSelectedBadges(prev => 
            prev.includes(badgeId) 
                ? prev.filter(id => id !== badgeId)
                : [...prev, badgeId]
        );
    };

    // Handle clearing all selections
    const handleClear = () => {
        setSelectedBadges([]);
        setOpen(false);
        toast.promise(AttachBadgefn({application_id: application_id, badge_ids: []}), {
            loading: "Processing...",
            success: data => data.data?.message,
            error: data => data.data?.message,
        })
    };

    // Handle applying badge selections
    const handleApply = () => {
        setOpen(false);
        toast.promise(AttachBadgefn({application_id: application_id, badge_ids: selectedBadges}), {
            loading: "Processing...",
            success: data => data.data?.message,
            error: data => data.data?.message,
        })
    };

    // Loading and error states
    if (existingBadgesLoading || allBadgesLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Dialog open={isOPen} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl p-0">
                <DialogHeader className='pb-0 px-2'>
                    <DialogTitle className='pt-4'>Available Badges</DialogTitle>
                </DialogHeader>
                <Separator className='my-0 py-0'/>
                <ScrollArea className='max-h-[65vh]'>
                <div className="grid grid-cols-2 gap-4 px-4">
                    {/* Available Badges Column */}
                    <div>
                        <div className="space-y-2">
                            {allBadgesData?.data?.data?.map((badge: TypeBadge) => (
                                <div key={badge.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`badge-${badge.id}`}
                                        checked={selectedBadges.includes(badge.id)}
                                        onCheckedChange={() => handleBadgeToggle(badge.id)}
                                    />
                                    <label 
                                        htmlFor={`badge-${badge.id}`}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <Badge 
                                            name={badge.name}
                                            color={badge.color}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </ScrollArea>
                <Separator />
                <DialogFooter className='pb-2 px-2'>
                    <Button 
                        variant="destructive" 
                        onClick={handleClear}
                    >
                        Clear Selections
                    </Button>
                    <Button onClick={handleApply}>
                        Apply Badges
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
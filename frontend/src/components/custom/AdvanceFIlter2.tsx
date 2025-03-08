import { Job } from '@/@types/job';
import { useJobs } from '@/app/store';
import { getAdvanceFilterInfo2 } from '@/service/InterviewService';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import Badge from './Badge';
import ReactSelect from './Select/react-select';


interface UsersInfo {
  source: string;
}

interface BadgeInfo {
  id: string;
  name: string;
  color: string;
}

interface FilterState {
    [key: string]: any;
}

const AdvanceFilter2 = ({
    open,
    setOpen,
    setFilter,
    Filter,
}: {
    open: boolean;
    setOpen: (state: boolean) => void;
    setFilter: (filter: FilterState) => void;
    Filter: FilterState;
}) => {    
    // Temporary filter state (changes while dialog is open)
    const [pendingFilter, setPendingFilter] = useState<FilterState>({});

    // zustand state variables
    const jobs = useJobs(state => state.jobs);

    // Initialize pendingFilter with activeFilter when dialog opens
    useEffect(() => {
        setPendingFilter({...Filter});
    }, [open, Filter]);

    // get Advance Filter info
    const { data: AdvanceFilterData, isLoading: AdvanceFilterisLoading } = useQuery({
        queryKey: ['getAdvanceFilterInfo2'],
        queryFn: getAdvanceFilterInfo2,
    });
    
    // For multi-select options
    const handleFilterChange = (field: string, selectedOptions: any) => {
        if (Array.isArray(selectedOptions)) {
        // Extract just the values from the array of option objects
        const values = selectedOptions.map(option => option.value);
        setPendingFilter(prev => ({...prev, [field]: values}));
        } else if (selectedOptions) {
        // For single select, just get the value
        setPendingFilter(prev => ({...prev, [field]: selectedOptions.value}));
        } else {
        // If the selection is cleared
        setPendingFilter(prev => {
            const newFilter = {...prev};
            delete newFilter[field];
            return newFilter;
        });
        }
    };
    
    // Convert active filter values back to ReactSelect format for display
    const getSelectedOptions = (field: any, options: any) => {
        if (!pendingFilter[field]) return undefined;
        
        const values = Array.isArray(pendingFilter[field]) 
            ? pendingFilter[field] 
            : [pendingFilter[field]];
            
        return options?.filter((option: any) => 
            values.includes(option.value)
        ) || undefined;
    };
      
    const ListOfSource = AdvanceFilterData?.data?.data?.users?.map((info: UsersInfo) => ({value: info.source, label: info.source}));
    const ListOfJobs = jobs?.map((info: Job) => ({value: info.id, label: info.title}));
    const ListOfBadges = AdvanceFilterData?.data?.data?.badges?.map((info: BadgeInfo) => ({value: info.id, label: <Badge name={info.name} color={info.color} />}));
    const ListOfInterviewers = AdvanceFilterData?.data?.data?.Interviewer?.map((info: {username: string, id: string}) => ({value: info.id, label: info.username}));
    
    const departmentOptions = [
        { "value": "R&D", "label": "R&D" },
        { "value": "Electronics", "label": "Electronics" },
        { "value": "Production", "label": "Production" },
        { "value": "HR", "label": "HR" },
        { "value": "Sales", "label": "Sales" },
        { "value": "Account", "label": "Account" },
        { "value": "HouseKeeping", "label": "HouseKeeping" }
    ];
    
    const statusOptions = [
        { "value": "Scheduled", "label": "Scheduled" },
        { "value": "Rescheduled", "label": "Rescheduled" },
        { "value": "Cancelled", "label": "Cancelled" },
        { "value": "Under Review", "label": "Under Review" },
        { "value": "Completed", "label": "Completed" },
    ];

    const InterviewTypeOptions = [
        { "value": "Technical Interview", "label": "Technical Interview" },
        { "value": "HR Interview", "label": "HR Interview" },
        { "value": "CEO Interview", "label": "CEO Interview" },
        { "value": "Trial Round", "label": "Trial Round" },
    ];

    // Handle clearing all filters
    const handleClearFilters = () => {
        setPendingFilter({});
        setFilter({});
        setOpen(false);
    };

    // Handle applying filters
    const handleApplyFilters = () => {
        setFilter(pendingFilter);
        setOpen(false);
    };    

    return (
     <Dialog 
        open={open} 
        onOpenChange={setOpen}
     >
     <DialogContent className="lg:max-w-[1000px] p-0 max-h-dvh overflow-auto" onInteractOutside={e => e.preventDefault()}>
         <DialogHeader className="p-4">
           <DialogTitle>Filter</DialogTitle>
         </DialogHeader>
         <Separator />
           <div className="grid grid-cols-1 md:grid-cols-2 p-2 gap-6">
            {/* FirstName */}
            <div className="flex flex-col space-y-2">
              <Label>FirstName</Label>
              <Input
                value={pendingFilter?.firstname}
                onChange={(e) => handleFilterChange('firstname', {value: e.target.value})}
              />
            </div>
            {/* LastName */}
            <div className="flex flex-col space-y-2">
              <Label>LastName</Label>
              <Input
                value={pendingFilter?.lastname}
                onChange={(e) => handleFilterChange('lastname', {value: e.target.value})}
              />
            </div>
           {/* Department */}
           <div className="flex flex-col space-y-2">
           <Label>Department</Label> 
           <ReactSelect 
               options={departmentOptions}
               isMulti
               isLoading={AdvanceFilterisLoading}
               value={getSelectedOptions('department', departmentOptions)}
               className="min-w-44"
               onChange={val => handleFilterChange('department', val)}
             />
             </div>
             {/* Status */}
             <div className="flex flex-col space-y-2">
             <Label>Status</Label>
             <ReactSelect 
               options={statusOptions}
               isClearable
               isLoading={AdvanceFilterisLoading}
               value={getSelectedOptions('status', statusOptions)}
               className="min-w-44"
               onChange={val => handleFilterChange('status', val)}
             />
             </div>
           {/* Source of Hire */}
           <div className="flex flex-col space-y-2"> 
             <Label>Source of Hire</Label>
             <ReactSelect 
               options={ListOfSource}
               isMulti
               value={getSelectedOptions('source_of_hire', ListOfSource)}
               onChange={(val) => handleFilterChange('source_of_hire', val)}
               isClearable
               isLoading={AdvanceFilterisLoading}
               isSearchable
             />
           </div>
           {/* List of Jobs */}
           <div className="flex flex-col space-y-2"> 
             <Label>Jobs</Label>
             <ReactSelect 
               options={ListOfJobs}
               isMulti
               value={getSelectedOptions('job_title', ListOfJobs)}
               isClearable
               onChange={(val) => handleFilterChange('job_title', val)}
               isLoading={AdvanceFilterisLoading}
               isSearchable
             />
           </div>
           {/* List of Badges */}
           <div className="flex flex-col space-y-2"> 
             <Label>Badges</Label>
             <ReactSelect 
               options={ListOfBadges}
               value={getSelectedOptions('badges', ListOfBadges)}
               onChange={(val) => handleFilterChange('badges', val)}
               isClearable
               isLoading={AdvanceFilterisLoading}
               isMulti
               isSearchable={false}
             />
           </div>
           {/* List of Interviewers */}
           <div className="flex flex-col space-y-2"> 
             <Label>Interviewer</Label>
             <ReactSelect 
               options={ListOfInterviewers}
               value={getSelectedOptions('interviewers', ListOfInterviewers)}
               onChange={(val) => handleFilterChange('interviewers', val)}
               isClearable
               isLoading={AdvanceFilterisLoading}
               isMulti
               isSearchable={false}
             />
           </div>
           {/* List of Interview Type */}
           <div className="flex flex-col space-y-2"> 
             <Label>Type</Label>
             <ReactSelect 
               options={InterviewTypeOptions}
               value={getSelectedOptions('interview_type', InterviewTypeOptions)}
               onChange={(val) => handleFilterChange('interview_type', val)}
               isClearable
               isLoading={AdvanceFilterisLoading}
               isMulti
               isSearchable={false}
             />
           </div>
           {/* Scheduled At */}
           <div className="flex flex-col space-y-2"> 
             <Label>Scheduled At</Label>
             <Input 
               type='date'
               value={pendingFilter?.scheduled_at}
               onChange={(e) => {handleFilterChange('scheduled_at',{ value: e.target.value})}}
             />
           </div>
           </div>
           <Separator />
           <DialogFooter className="p-2">
             <Button variant="outline" onClick={handleClearFilters}>
                 Clear
             </Button>
             <Button onClick={handleApplyFilters}>
                 Apply
             </Button>
           </DialogFooter>
       </DialogContent>
     </Dialog>
    );
};

export default AdvanceFilter2;
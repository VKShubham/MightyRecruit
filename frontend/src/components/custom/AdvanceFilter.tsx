import { Job } from '@/@types/job';
import { useJobs } from '@/app/store';
import { getAdvanceFilterInfo } from '@/service/ApplicationService';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import Badge from './Badge';
import ReactSelect from './Select/react-select';
import { Input } from '../ui/input';


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

const AdvanceFilter = ({
  open,
  setOpen,
  setFilter,
  Filter
}: {
  open: boolean;
  setOpen: (state: boolean) => void;
  setFilter: (filter: FilterState) => void;
  Filter: FilterState;
}) => {
  // Current active filter state (already applied)
  const [activeFilter, setActiveFilter] = useState<FilterState>({});

  // Temporary filter state (changes while dialog is open)
  const [pendingFilter, setPendingFilter] = useState<FilterState>({});

  // zustand state variables
  const jobs = useJobs(state => state.jobs);

  // Initialize pendingFilter with activeFilter when dialog opens
  useEffect(() => {
    if (open) {
      setPendingFilter({ ...activeFilter });
    }
  }, [open, activeFilter]);

  // get Advance Filter info
  const { data: AdvanceFilterData, isLoading: AdvanceFilterisLoading } = useQuery({
    queryKey: ['getAdvanceFilterInfo'],
    queryFn: getAdvanceFilterInfo,
  });

  // For multi-select options
  const handleFilterChange = (field: string, selectedOptions: any) => {
    if (Array.isArray(selectedOptions)) {
      // Extract just the values from the array of option objects
      const values = selectedOptions.map(option => option.value);
      setPendingFilter(prev => ({ ...prev, [field]: values }));
    } else if (selectedOptions) {
      // For single select, just get the value
      setPendingFilter(prev => ({ ...prev, [field]: selectedOptions.value }));
    } else {
      // If the selection is cleared
      setPendingFilter(prev => {
        const newFilter = { ...prev };
        delete newFilter[field];
        return newFilter;
      });
    }
  };

  // Initialize pendingFilter with activeFilter when dialog opens
  useEffect(() => {
    setPendingFilter({ ...Filter });
  }, [open, Filter]);

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

  const ListOfSource = AdvanceFilterData?.data?.data?.users?.map((info: UsersInfo) => ({ value: info.source, label: info.source }));
  const ListOfJobs = jobs?.map((info: Job) => ({ value: info.title, label: info.title }));
  const ListOfBadges = AdvanceFilterData?.data?.data?.badges?.map((info: BadgeInfo) => ({ value: info.id, label: <Badge name={info.name} color={info.color} /> }));

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
    { "value": "Hired", "label": "Hired" },
    { "value": "Rejected", "label": "Rejected" },
  ];

  const updatedAtOptions = [
    { value: 0, label: "Today" },
    { value: 1, label: "Last 1 day" },
    { value: 2, label: "Last 2 day" },
    { value: 3, label: "Last 3 day" },
    { value: 5, label: "Last 5 day" },
    { value: 7, label: "Last week" },
    { value: 21, label: "Last 3 week" },
    { value: 30, label: "Last month" },
    { value: 90, label: "Last 3 month" },
    { value: 180, label: "Last 6 month" },
    { value: 365, label: "Last Year" },
  ];

  const roundOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item => ({ value: item, label: item }));

  // Handle clearing all filters
  const handleClearFilters = () => {
    setPendingFilter({});
    setActiveFilter({});
    setFilter({});
    setOpen(false);
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    setActiveFilter(pendingFilter);
    setFilter(pendingFilter);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="lg:max-w-[1100px] p-0 overflow-auto max-h-dvh" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader className="pb-0 px-2">
          <DialogTitle className='pt-4'>Filter</DialogTitle>
        </DialogHeader>
        <Separator className='my-0 py-0' />
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
                value={getSelectedOptions('jobs', ListOfJobs)}
                isClearable
                onChange={(val) => handleFilterChange('jobs', val)}
                isSearchable
              />
            </div>
            {/* List of Rounds */}
            <div className="flex flex-col space-y-2">
              <Label>Rounds</Label>
              <ReactSelect
                options={roundOptions}
                isClearable
                value={getSelectedOptions('round', roundOptions)}
                onChange={(val) => handleFilterChange('round', val)}
                isSearchable
              />
            </div>
            {/* Last Updated */}
            <div className="flex flex-col space-y-2">
              <Label>Last Updated</Label>
              <ReactSelect
                onChange={(val) => handleFilterChange('updated_at', val)}
                options={updatedAtOptions}
                value={getSelectedOptions('updated_at', updatedAtOptions)}
                isClearable
                isSearchable={false}
                menuPlacement='top'
              />
            </div>
            {/* List of Badges */}
            <div className="flex flex-col space-y-2 relative">
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
          </div>
        <Separator />
        <DialogFooter className='pb-2 px-2'>
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

export default AdvanceFilter;
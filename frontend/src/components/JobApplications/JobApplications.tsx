import { Application, Application_status } from "@/@types/application"
import { useJobs, useUser } from "@/app/store"
import { changeApplicationStatus, getPendingApplications } from "@/service/ApplicationService"
import { multiSelectFilterFn } from "@/util/PrimeReact"
import { formatDate } from "@/util/date"
import { RiAttachment2 } from "@remixicon/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper } from '@tanstack/react-table'
import { AxiosError } from "axios"
import { Briefcase, Building2, CalendarDays, ChevronDown, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import CandidateDetail from "../CandidateDetail/CandidateDetail"
import { AttachBadgeDialog } from "../custom/AttachBadgeDialog"
import CustomTable, { FilterConfig } from "../custom/CustomTable"
import InfoComponent from "../custom/InfoComponet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

type Columns = {
  title: string;
  created_at: string;
  applied_at: string;
  department: string;
  expander?: string;
  buttons?: any;
  candidate_id?: string;
  application_id?: string;
}

const JobApplicationsList = () => {

  // page state Variables
  const [data, setData] = useState<Columns[]>([]);  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [AttachisDialogOpen, setAttachisDialogOpen] = useState(false);
  const [applicationID, setApplicationId] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<Application_status>();
  const notes = useRef<HTMLTextAreaElement>(null);

  // react queryClient variables
  const queryClient = useQueryClient();

  // zustand state variables
  const removeuser = useUser(state => state.removeUser);
  const jobs = useJobs(state => state.jobs);

  // React router variable
  const navigate = useNavigate();

  // get all pending application
  const { data: ApplicationData, isLoading, error } = useQuery({
    queryKey: ['getPendingApplication'],
    queryFn: () => getPendingApplications(),
  })

  if((error as AxiosError)?.status === 403) {
    removeuser();
    navigate('/login');
  }

  // it change status of an application
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['changeApplicationStatus'],
    mutationFn: ({ application_id, status, notes }: { application_id: string, status: Application_status, notes: string }) => changeApplicationStatus(application_id, status, notes),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['getPendingApplication'], exact: false });
      queryClient.refetchQueries({queryKey: ['getPendingApplication']})
    },
    onError: (error: any) => {
      if(error.status === 403) {
        window.location.href = '/login'
        removeuser();
      }
    }
  })

  // Page Functions
  const handleChangeStatus = useCallback((application_id: string, status: Application_status) => {
    setApplicationId(application_id);
    setSelectedStatus(status);
    setIsDialogOpen(true);
  }, []);

  const handleConfirm = () => {
    if (applicationID && selectedStatus) {
      setIsDialogOpen(false);
      toast.promise(mutateAsync({ application_id: applicationID, status: selectedStatus, notes: notes.current?.value || '' }), {
        loading: 'Loading...',
        success: `${selectedStatus}ed Successfully`,
        error: `Failed yo ${selectedStatus}`
      })
    }
  };
  

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Columns>();
    return [
    columnHelper.accessor('title', {
      header: 'Job Title',
      enableColumnFilter: true,
      filterFn: "includesString",
      cell: info => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
      enableSorting: false
    }),
    columnHelper.accessor('created_at', {
      header: 'Posted At',
      cell: info => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span>{formatDate(info.getValue())}</span>
        </div>
      )
    }),
    columnHelper.accessor('applied_at', {
      header: 'Applied At',
      cell: info => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span>{formatDate(info.getValue())}</span>
        </div>
      )
    }),
    columnHelper.accessor('department', {
      header: 'Department',
      cell: info => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span>{info.getValue()}</span>
        </div>
      ),
      filterFn: multiSelectFilterFn,
      enableSorting: false
    }),
    columnHelper.accessor('expander', {
      header: 'Details',
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            {row.getIsExpanded() ? (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Hide Details</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>View Details</span>
              </>
            )}
          </button>
        ) : null
      },
      enableSorting: false
    }),
    columnHelper.accessor('buttons', {
      header: () => null,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm" 
              onClick={() => handleChangeStatus(row.original.application_id || '', Application_status.InProcess)}>
              Approve
            </Button>
            <Button
              size="sm" 
              onClick={() => handleChangeStatus(row.original.application_id || '', Application_status.Rejected)}
              variant="destructive">
              Reject
            </Button>
            <Tooltip delayDuration={300}>
              <TooltipTrigger>
              <Button
                size="sm" 
                onClick={() => {
                  setAttachisDialogOpen(true);
                  setApplicationId(row.original.application_id);
                }}
                variant="outline">
                <RiAttachment2 />
              </Button>
              <TooltipContent>Attach Badge</TooltipContent>
              </TooltipTrigger>  
            </Tooltip>
          </div>
        )
      },
      enableSorting: false
    }),
  ]}, [handleChangeStatus]);


  const FilterConfig: FilterConfig[] = [
    {
      id: 'title',
      type: 'text',
      label: 'Job Title'
    },
    {
      id: 'department',
      type: 'multi-select',
      label: 'Select department',
      options: [
        { "value": "R&D", "label": "R&D" },
        { "value": "Electronics", "label": "Electronics" },
        { "value": "Production", "label": "Production" },
        { "value": "HR", "label": "HR" },
        { "value": "Sales", "label": "Sales" },
        { "value": "Account", "label": "Account" },
        { "value": "HouseKeeping", "label": "HouseKeeping" }
      ]      
    },
  ]

  const mergedData = useMemo(() => {
    if (!ApplicationData) return [];
    return ApplicationData.data?.data?.map((application: Application) => {
      const job = jobs?.find(job => job.id === application.job_id);
      return {
        title: job?.title || '',
        created_at: job?.created_at || '',
        applied_at: application.applied_at,
        department: job?.department || '',
        candidate_id: application.candidate_id,
        application_id: application.id,
      };
    });
  }, [ApplicationData, jobs]);
  
  useEffect(() => {
    setData(mergedData);
  }, [mergedData]);


  if(error) return <InfoComponent type="error" title="Something went wrong" message="Please try after some time!"/>
  
  return (
    <div className="max-w-screen">
        <div>
            <CustomTable 
              data={data}
              columns={columns}
              title="Job Applications"
              isLoading={isLoading}
              showAddButton={false}
              filterConfig={FilterConfig}
              renderSubComponent={CandidateDetail}
            />
        </div>
          <AlertDialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want {selectedStatus === Application_status.InProcess ? 'Accept' : 'Reject'} this application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea 
                placeholder="here you can add notes for this action (Optional)"
                ref={notes}
                />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleConfirm} 
                  disabled={isPending}
                >
                Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AttachBadgeDialog 
            isOPen={AttachisDialogOpen}
            setOpen={setAttachisDialogOpen}
            application_id={applicationID || ""}
          />
      </div>
  );
}

export default JobApplicationsList;
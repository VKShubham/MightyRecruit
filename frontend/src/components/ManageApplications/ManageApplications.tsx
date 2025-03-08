import { Application, Application_status } from "@/@types/application"
import { Badge as TypeBadge } from "@/@types/badge"
import { Interview_result, interview_status, InterviewData } from "@/@types/interview"
import { Job } from "@/@types/job"
import { useJobs, useUser } from "@/app/store"
import { getApprovedApplications, getNextStageDetails } from "@/service/ApplicationService"
import { createInterview } from "@/service/InterviewService"
import { multiSelectFilterFn } from "@/util/PrimeReact"
import { RiAttachment2 } from "@remixicon/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper, flexRender, getCoreRowModel, HeaderGroup, Row, useReactTable } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Briefcase, Building2, CalendarPlus2, ChevronDown, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileUser, Filter, Info, Loader2, RefreshCcw, User, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import ApplicationDetail from "../ApplicationDetail/ApplicationDetail"
import CandidateDetail from "../CandidateDetail/CandidateDetail"
import AdvanceFilter from "../custom/AdvanceFilter"
import { AttachBadgeDialog } from "../custom/AttachBadgeDialog"
import Badge from "../custom/Badge"
import InfoComponent from "../custom/InfoComponet"
import ScheduleRoundDialog from "../custom/ScheduleRoundDialog"
import { Badge as ShadcnBadge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ScrollArea } from "../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

type Columns = {
  fullname: string;
  title: string;
  applied_at: string;
  department: string;
  interview_status?: string;
  interview_id?: string;
  expander?: string;
  buttons?: any;
  candidate_id?: string;
  application_id?: string;
  status?:Application_status;
  badges: TypeBadge;
  rounds: string;
  selection_pipeline_id: String[];
}

interface ApplicationDetails {
  id: string;
  job_id: string;
  stage_name: string;
}

interface TableData extends Application {
  full_name: string;
  interview_id?: string;
  badges: TypeBadge;
  rounds: string;
}

interface ScheduleDetails {
  datetime: string;
  interviewerid: string;
  meet_link: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
export interface FilterState {
  [key: string]: any;
}

const renderSortableHeader = (header: any) => {
  const column = header.column;
  const isSortable = column.getCanSort();

  if (!isSortable) {
    return flexRender(column.columnDef.header, header.getContext());
  }

  return (
    <div
      className="flex items-center cursor-pointer select-none group transition-colors hover:text-primary"
      onClick={column.getToggleSortingHandler()}
    >
      <span className="font-semibold text-xs md:text-sm">
        {flexRender(column.columnDef.header, header.getContext())}
      </span>
      <span className="ml-1.5 flex items-center">
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className="w-4 h-4" />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className="w-4 h-4" />
        ) : (
          <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </span>
    </div>
  );
};

const TableRowWithExpansion = ({ row }: { row: Row<any> }) => {
  return (
    <>
      <TableRow
        className={`
          transition-colors
          hover:bg-gray-50 dark:hover:bg-gray-900`}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="py-3 text-xs md:text-sm">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};


const ManageApplications = () => {

  // use Query variables
  const queryClient = useQueryClient();

  // page state Variables
  const [data, setData] = useState<Columns[]>([]);  // list of data for an table
  const [ScheduleOpen, setScheduleOpen] = useState(false);
  const [candidateOpen, setCandidateOpen] = useState(false);
  const [AttachBadgeOpen, setAttachBadgeOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [AdvanceFilterOpen, setAdvanceFilterOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  const [application_details, setApplication_details] = useState<ApplicationDetails>(); // for subcomponet it gets an application details
  const [application_id, setApplication_id] = useState('');
  const [candidate_id, setCandidate_id] = useState('');
  const [filter, setFilter] = useState<FilterState>({});

  // zustand state variables
  const jobs = useJobs(state => state.jobs);
  const removeuser = useUser(state => state.removeUser)

  // get all pending application (Table Data for ex)
  const { data: ApplicationData, isLoading, error, isFetching } = useQuery({
    queryKey: ['getApprovedApplication', filter, pagination.page, pagination.pageSize],
    queryFn: () => getApprovedApplications({
      ...filter, 
      page: pagination.page, 
      pageSize: pagination.pageSize
    }),
  })
  
  // NextStage details data
  const { data: NextStageDetails, isLoading: NextStageDetailisLoading, error: NextStageDetailError } = useQuery({
    queryKey: ['getNextStageDetails', application_id],
    queryFn: () => getNextStageDetails(application_id || ''),
    enabled: application_id.length > 0
  }) 
  
  // schedule interview mutation
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['createinterview'],
    mutationFn: createInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getApprovedApplication']})
    },
    onError: (error: any) => {
      if(error.status === 403) {
        window.location.href = '/login'
        removeuser();
      }
    },
  })
  
  useEffect(() => {
     setApplication_details(NextStageDetails?.data.nextStage)
  },[NextStageDetails])

  useEffect(() => {
    if(!ScheduleOpen) {
      setApplication_id('');
    }
  },[ScheduleOpen])
  
  const handleConfirm = (data: ScheduleDetails) => {
    setScheduleOpen(false);
    const InterviewData: InterviewData = {
      scheduled_at: data.datetime,
      application_id: application_id,
      meeting_link: data.meet_link,
      interviewer_id: data.interviewerid,
      result: Interview_result.Pass,
      status: interview_status.Scheduled,
      selection_pipeline_id: application_details?.id || '',
      candidate_id: candidate_id,
      stage_name: application_details?.stage_name
    }
    toast.promise(mutateAsync(InterviewData), {
      loading: 'Scheduling Interview...',
      success: 'Interview Scheduled',
      error: 'Failed to schedule interview'
    })
  };

  const renderAppliedFilters = () => {
    const filterKeys = Object.keys(filter);
    
    // If no filters are applied, return null
    if (filterKeys.length === 0) return null;

    const removeFilter = (key: string) => {
     setFilter(prev => {
      const newFilter = {...prev};
      delete newFilter[key];
      return newFilter;
    });
    };

    return (
      <div className="flex items-center flex-wrap gap-2 p-2">
        <span className="text-sm font-semibold">Your Filters:</span>
        {filterKeys.map((key) => {
          let displayValue = filter[key];
          let length = 0;
          
          // Handle different types of filter values
          if (Array.isArray(displayValue)) {
            length = displayValue.length;
          }
          
          return (
            <ShadcnBadge 
              key={key} 
              variant="secondary" 
              className="flex items-center gap-2 py-1"
            >
              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
              <div className="h-3 bg-gray-600 w-[0.5px]"></div>
              <span className="font-semibold">{length > 1 ? `${length} Selected` : displayValue}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1"
                onClick={() => removeFilter(key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </ShadcnBadge>
          );
        })}
      </div>
    );
  };

  // react table columns
  const columnHelper = createColumnHelper<Columns>();
  
  const columns = [
    columnHelper.accessor('fullname', {
      header: 'Full Name',
      cell: info => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span>{info.getValue()}</span>
        </div>
      ),
      enableSorting: false
    }),
    columnHelper.accessor('title', {
      header: 'Job Title',
      cell: info => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
      enableSorting: false
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
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <ShadcnBadge className="w-20" variant={`${info.getValue() === 'Hired' ? "success" : info.getValue() === 'Rejected' ? 'destructive' : 'pending'}`}>
          {info.getValue()}
        </ShadcnBadge>
      ),
      enableSorting: false
    }),
    columnHelper.accessor('badges', {
      header: 'Badges',
      cell: info => {
        const badges = info.getValue();
        // Ensure badges is always an array
        const badgesArray: TypeBadge[] = Array.isArray(badges) ? badges : badges ? [badges] : [];
        
        return (
          <div className="flex flex-col space-y-1">
            {badgesArray.map((badge, index) => (
              <Badge
                key={index}
                name={badge.name} 
                color={badge.color}
                className="text-[10px]"
              />
            ))}
          </div>
        )
      },
      enableSorting: false
    }),
    columnHelper.accessor('rounds', {
      header: 'Rounds',
      cell: ({ row }) => {
        const RoundsDone = row.original.selection_pipeline_id?.length || 0;
        const TotalRounds = Number(row.original.rounds);
        const progressPercentage = (RoundsDone / TotalRounds) * 100;
        return (
          <div className="flex items-center justify-center w-10 h-10 relative">
          {/* Background circle */}
          <svg className="absolute w-full h-full" viewBox="0 0 36 36">
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none" 
              className="stroke-current text-gray-200" 
              strokeWidth="4"
            />
          </svg>
          
          {/* Progress circle */}
          <svg className="absolute w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none" 
              className="stroke-current text-primary" 
              strokeWidth="4"
              strokeDasharray="100"
              strokeDashoffset={100 - progressPercentage}
            />
          </svg>
          
          {/* Text in the middle */}
          <div className="absolute text-[10px] font-bold">
            {RoundsDone}/{TotalRounds}
          </div>
        </div>
        )
      },
      enableSorting: false
    }),
    columnHelper.accessor('buttons', {
      header: () => 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                size="sm">
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => {
                  setApplication_id(row.original.application_id || "")
                  setApplicationOpen(true)
                }}
                className="flex items-center space-x-2"
              >
                <Info className="mr-2 h-4 w-4" />
                Application Info
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setCandidate_id(row.original.candidate_id || "")
                  setCandidateOpen(true)
                }}
                className="flex items-center space-x-2"
              >
                <FileUser className="mr-2 h-4 w-4" />
                Candidate Info
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setScheduleOpen(true)
                  setApplication_id(row.original.application_id || '')
                  setCandidate_id(row.original.candidate_id || '')
                }}
                disabled={isPending || (row.original.status === 'Rejected' || row.original.status === 'Hired')}
                className="flex items-center space-x-2"
              >
                <CalendarPlus2 className="mr-2 h-4 w-4" />
                Schedule Round
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setAttachBadgeOpen(true)
                  setApplication_id(row.original.application_id || '')
                }}
                disabled={isPending || (row.original.status === 'Rejected' || row.original.status === 'Hired')}
                className="flex items-center space-x-2"
              >
                <RiAttachment2 className="mr-2 h-4 w-4" />
                Attach Badge
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>  
</div>
    ),
    enableSorting: false
  })
  ]

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, 
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize
      }
    },
    onPaginationChange: (updater) => {
      // Calculate new page based on updater function
      const newPagination = typeof updater === 'function' 
        ? updater({
            pageIndex: pagination.page - 1,
            pageSize: pagination.pageSize
          })
        : updater;
      
      // Update pagination state with new page (adding 1 because table uses 0-indexed pages)
      setPagination(prev => ({
        ...prev,
        page: newPagination.pageIndex + 1
      }));
    }
  })   

  useEffect(() => {
    if(ApplicationData) {
      setPagination(prev => ({
        ...prev,
        totalCount: ApplicationData?.data?.pagination?.totalCount,
        totalPages: ApplicationData?.data?.pagination?.totalPages
      }));
      const mergedData = ApplicationData?.data?.data?.map((application: TableData) => {
        const job: Job = jobs.find((job) => job.id === application.job_id)
        return {
          fullname: application.full_name,
          title: job?.title,
          created_at: job?.created_at,
          applied_at: application.applied_at,
          department: job?.department,
          candidate_id: application.candidate_id,
          application_id: application.id,
          interview_id: application.interview_id,
          status: application.status,
          badges: application.badges,
          rounds: application.rounds,
          selection_pipeline_id: application.selection_pipeline_id,
        }
      }) 
      setData(mergedData);
    }
    else {
      setData([]);
    }
  }, [ApplicationData])
  
  if(error) return <InfoComponent type="error" message="please try after some time" title="Something went wrong" />
  
  return (
    <div className="max-w-screen">
          <Card className="w-full shadow-sm border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Manage Applications</CardTitle>
              </div>
            </CardHeader>
            <div className="p-2 flex space-x-2">
              <Tooltip delayDuration={400}>
                <TooltipTrigger>
                  <Button variant="outline" onClick={() => setAdvanceFilterOpen(true)}>
                    <Filter />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Advance Filter</TooltipContent>
              </Tooltip>
              {renderAppliedFilters()}
                <div className="min-h-full bg-gray-300 w-[0.5px]"></div>
                <div className="flex space-x-4 items-center">
                <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isFetching} onClick={() => queryClient.refetchQueries({queryKey: ['getApprovedApplication', filter, pagination.page, pagination.pageSize]})}>
                   { isFetching ? 'Fetching...' : <RefreshCcw className="w-4 h-4"/>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
                </div>
            </div>
            <div className="[&>div]:max-h-[calc(100vh-310px)]">
              <Table>
                <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
                  {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                    <TableRow key={headerGroup.id} className="bg-gray-50/50 dark:bg-gray-900/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="py-3">
                          {renderSortableHeader(header)}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length} className="h-32">
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                            <span className="text-sm text-gray-500">Loading data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row: Row<any>) => (
                        <TableRowWithExpansion key={row.id} row={row} />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length} className="h-32">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <span className="text-sm">No data available</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
              </Table>
            </div>
           <div className="flex items-center justify-between mt-4 p-2 md:mt-6 md:p-4">
            <div className="flex items-center md:gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  // Reset to first page when changing page size
                  setPagination(prev => ({
                    ...prev,
                    page: 1,
                    pageSize: Number(value)
                  }));
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPagination(prev => ({...prev, page: 1}))}
                disabled={pagination.page === 1}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronFirst className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                disabled={pagination.page === 1}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                disabled={pagination.page === pagination.totalPages}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPagination(prev => ({...prev, page: prev.totalPages}))}
                disabled={pagination.page === pagination.totalPages}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLast className="w-4 h-4" />
              </Button>
            </div>
          </div>
          </Card>
          <ScheduleRoundDialog
            key={application_id} 
            isDialogOpen={ScheduleOpen}
            setIsDialogOpen={setScheduleOpen}
            isLoading={NextStageDetailisLoading}
            error={NextStageDetailError}
            application_details={application_details}
            onConfirm={handleConfirm}
          />

          {/* Candidate info dialog */}
           <Dialog open={candidateOpen} onOpenChange={(state) => {
            setCandidateOpen(state);
            if(state === false) {
              setCandidate_id('');
            }
            }}>
            <DialogContent className="lg:max-w-[1100px] max-h-dvh overflow-auto p-0">
              <DialogHeader className="pb-0 px-2">
                <DialogTitle className="pt-4">Candidate Information</DialogTitle>
              </DialogHeader>
              <Separator className="my-0 py-0"/>
              <ScrollArea className="max-h-[700px]">
              <CandidateDetail 
              row={{
                original: {
                  candidate_id: candidate_id,
                },
              }}/>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Application Info Dialog */}
          <Dialog open={applicationOpen} onOpenChange={(state) => {
            setApplicationOpen(state);
            if(state === false) {
              setApplication_id('');
            }
            }}>
          <DialogContent className="lg:max-w-[1100px] p-0">
              <DialogHeader className="pb-0 px-2">
                <DialogTitle className="pt-4">Application Information</DialogTitle>
              </DialogHeader>
              <Separator className="my-0 py-0"/>
              <ScrollArea className="max-h-[700px]">
              <ApplicationDetail 
              row={{
                original: {
                  application_id: application_id,
                },
              }}/>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Advance Filter Dialog */}
          <AdvanceFilter 
          open={AdvanceFilterOpen}
          setOpen={setAdvanceFilterOpen}
          setFilter={setFilter}
          Filter={filter}
          />
          {/* Attach Badge Dialog */}
          <AttachBadgeDialog 
          isOPen={AttachBadgeOpen}
          setOpen={setAttachBadgeOpen}
          application_id={application_id}
          />
      </div>
  );
}

export default ManageApplications;
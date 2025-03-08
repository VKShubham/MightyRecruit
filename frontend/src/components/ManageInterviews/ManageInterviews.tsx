import { Badge as TypeBadge } from '@/@types/badge';
import { interview_status } from '@/@types/interview';
import { getHRInterviews } from '@/service/InterviewService';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, HeaderGroup, Row, useReactTable } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Briefcase, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Edit, Eye, Filter, Info, Loader2, RefreshCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdvanceFilter2 from '../custom/AdvanceFIlter2';
import Badge from '../custom/Badge';
import InfoComponent from '../custom/InfoComponet';
import EditInterViewDetails from '../EditInterViewDetails/EditInterViewDetails';
import FeedBackDetails from '../FeedbackDetails/FeedBackDetails';
import InterviewDetails from '../InterviewDetails/InterviewDetails';
import { FilterState, PaginationInfo } from '../ManageApplications/ManageApplications';
import { Badge as ShadcnBadge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type Columns = {
  id: string;
  fullname: string;
  badges: TypeBadge[];
  interviewer: string;
  scheduled_at: string;
  status: interview_status;
  title: string;
  actions?: any;
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

const ManageInterviews = () => {

  const queryClient = useQueryClient();
  const [AdvanceFilterOpen, setAdvanceFilterOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>({});

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  const [dialog, setDialog] = useState<{ open: boolean; type: 'info' | 'edit' | 'feedback' | null; interview_id: string }>({
    open: false,
    type: null,
    interview_id: '',
  });

  const openDialog = (type: 'info' | 'edit' | 'feedback', interview_id: string) => {
    setDialog({ open: true, type, interview_id });
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
  
  // getting all HR interviews data
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ['getHRInterviews', filter, pagination.page, pagination.pageSize],
    queryFn: () => getHRInterviews({
      ...filter, 
      page: pagination.page, 
      pageSize: pagination.pageSize
    })
  })
  
  const [Interviews, setInteviews] = useState<Columns[]>([]);
    useEffect(() => {
      setInteviews(data?.data.data)
      setPagination(prev => ({
        ...prev,
        totalCount: data?.data?.pagination?.totalCount,
        totalPages: data?.data?.pagination?.totalPages
      }));
    },[data])
  
  const columnHelper = createColumnHelper<Columns>();

  const columns = [
    columnHelper.accessor('fullname', {
      header: 'Candidate name',
      cell: info => info.getValue(),
      enableSorting: false
    }),
      columnHelper.accessor('interviewer', {
        header: 'Interviewer',
        cell: info => info.getValue(),
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
      columnHelper.accessor('scheduled_at', {
        header: 'Scheduled At',
        cell: info => new Date(info.getValue()).toLocaleString(),
        enableSorting: false
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          return (
            <ShadcnBadge className='w-24' variant={`${status === interview_status.Cancelled 
            ? "destructive" : status === interview_status.Completed 
            ? "success" : "pending"}`}>
              {status}
            </ShadcnBadge>
          )
          },
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
        columnHelper.accessor('actions', {
          header:'Actions',
          cell: ({ row }) => {
            if(row.original.status === interview_status.Cancelled || row.original.status === interview_status.Completed) {
              return (
                <div className='space-x-1'>
                <Button className='w-7 h-7' onClick={() => openDialog('info', row.original.id)}>
                  <Info />
                </Button>
              </div>
              )
            }
            if(row.original.status === interview_status.UnderReview) {
              return (<div className='space-x-1'>
                <Button className='w-7 h-7' onClick={() => openDialog('info', row.original.id)}>
                  <Info />
                </Button>
                <Button variant="secondary" className='w-7 h-7' onClick={() => openDialog('feedback', row.original.id)}>
                  <Eye />
                </Button>
              </div>
              )
            }
            return (
              <div className='space-x-1 space-y-1'>
              <Button className='w-7 h-7' onClick={() => openDialog('info', row.original.id)}>
                <Info />
              </Button>
              <Button className='w-7 h-7' onClick={() => openDialog('edit', row.original.id)}>
                <Edit />
              </Button>
            </div>
            )
          },
          enableSorting: false
        })
  ]

    const table = useReactTable({
        data: Interviews || [],
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

    if(error) return <InfoComponent title="Someting went wrong!" type="error" message="Please try after some time"/>    
    return (
      <div className='max-w-screen'>
     <div>
          <Card className="w-full shadow-sm border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Manage Interviews</CardTitle>
              </div>
            </CardHeader>
            <div className="p-2 flex space-x-2">
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
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
                  <Button variant="ghost" size="sm" disabled={isFetching} onClick={() => queryClient.refetchQueries({queryKey: ['getHRInterviews', filter, pagination.page, pagination.pageSize]})}>
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
                <TableBody className="max-h-screen">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={table.getAllColumns().length} className="h-32">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin mb-2" />
                          <span className="text-sm text-gray-500">Loading data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows?.map((row: Row<any>) => (
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
           <div className="flex items-center justify-between mt-6 p-4">
            <div className="flex items-center gap-3">
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
              <span className="text-sm text-gray-600 dark:text-gray-400">
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
          {/* Advance Filter Dialog */}
          <AdvanceFilter2 
          open={AdvanceFilterOpen}
          setOpen={setAdvanceFilterOpen}
          setFilter={setFilter}
          Filter={filter}
          />
      </div>
      <Dialog open={dialog.open} onOpenChange={(isOpen) => setDialog(prev => ({ ...prev, open: isOpen }))}>
        <DialogContent className={`rounded-lg p-0 ${dialog.type === 'info' || dialog.type === 'feedback'  ? 'max-w-sm lg:min-w-[1100px]' : ''}`} onInteractOutside={e => e.preventDefault()}>
          <DialogHeader className='pb-0 px-2'>
            <DialogTitle className='pt-4'>{dialog.type === 'info' ? 'Interview Details' : dialog.type === 'edit' ? 'Edit Interview' : 'Interview Result'}</DialogTitle>
          </DialogHeader>
          <Separator />
          <ScrollArea className='max-h-[65vh]'>
          {dialog.type === 'info' && <InterviewDetails interview_id={dialog.interview_id} />}
          {dialog.type === 'feedback' && <FeedBackDetails id={dialog.interview_id} setIsopen={setDialog} />}
          {dialog.type === 'edit' && <EditInterViewDetails interview_id={dialog.interview_id} setIsopen={setDialog}/>}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageInterviews
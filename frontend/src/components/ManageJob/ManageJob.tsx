import { Job, job_status } from '@/@types/job'
import { useUser } from '@/app/store'
import { getAllJobs } from '@/service/JobService'
import { multiSelectFilterFn } from '@/util/PrimeReact'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { AxiosError } from 'axios'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JobEdit from '../JobEdit/JobEdit'
import CustomTable, { FilterConfig } from '../custom/CustomTable'
import InfoComponent from '../custom/InfoComponet'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Separator } from '../ui/separator'

const ManageJob = () => {

    interface jobData {
        id: string;
        title: string;
        department: string;
        created_at: string;
        status: job_status;
        total_vacancy: number;
        actions: any;
    }

    // React router and zustand variable
    const navigate = useNavigate();
    const removeuser = useUser(state => state.removeUser);

    // page state variables
    const [jobs, setJobs] = useState<jobData[]>([]);
    const [dialog, setDialog] = useState(false);
    const [job_id, setJob_id] = useState('');
    
    // fetch list of jobs
    const { data, isLoading, error} = useQuery({
        queryKey: ['getAllJobs'],
        queryFn: getAllJobs
    })

    if((error as AxiosError)?.status === 403) {
      removeuser();
      navigate('/login');
    }

    // set list of jobs
    useEffect(() => {
        const job = data?.data.jobs
        const jobDataList: jobData[] = job?.map((job: Job) => ({
            id: job.id,
            title: job.title,
            department: job.department,
            created_at: new Date(job.created_at).toLocaleDateString(),
            status: job.status,
            total_vacancy: parseInt(job.total_vacancy) - job.total_hired
        })) || [];
        setJobs(jobDataList);
    },[data])    

    const columnHelper = createColumnHelper<jobData>();

    const columns = [
        columnHelper.accessor('title', {
            header: 'Title',
            cell: info => info.getValue(),
            enableSorting: false
        }),
        columnHelper.accessor('department', {
            header: 'Department',
            cell: info => info.getValue(),
            enableSorting: false,
            filterFn: multiSelectFilterFn
        }),
        columnHelper.accessor('created_at', {
            header: 'Posted At',
            cell: info => info.getValue(),
            
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => (
                <Badge className='w-14' variant={info.getValue() === job_status.Active ? "success" : "destructive"}>{info.getValue()}</Badge>
            ),
            enableSorting: false
        }),
        columnHelper.accessor('total_vacancy', {
            header: 'Vacant',
            cell: (info) => info.getValue()
        }),
        columnHelper.accessor('actions', {
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <Button 
                    variant="ghost"
                    onClick={() => {
                        setDialog(true);
                        setJob_id(row.original.id);
                    }}
                    >
                        <Pencil className='text-green-700' />
                    </Button>
                )
            }
        })
    ];

    
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
    {
      id: 'status',
      type: 'select',
      label: 'Select Status',
      options: [
        { "value": "Open", "label": "Open" },
        { "value": "Closed", "label": "Closed" }
      ]      
    },
  ]

    if(error) return <InfoComponent type='error' title='Error' message='something went wrong please try again!'/>


  return (
    <div className='max-w-screen'>
        <CustomTable 
            data={jobs}
            columns={columns}
            title='Manage Job'
            showAddButton={false}
            isLoading={isLoading}
            filterConfig={FilterConfig}
        />
        <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogContent className='lg:min-w-[1100px] p-0'>
                <DialogHeader className='pb-0 px-2'>
                    <DialogTitle className='pt-4'>
                    Edit Job Details
                    </DialogTitle>
                </DialogHeader>
                <Separator className='my-0 py-0'/>
                <JobEdit
                    id={job_id}
                    setIsDialogOpen={setDialog}
                />
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default ManageJob
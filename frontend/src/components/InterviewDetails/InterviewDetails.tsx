import { getInterviewRelatedDetails } from '@/service/InterviewService'
import { useQuery } from '@tanstack/react-query'
import { ScrollArea } from '../ui/scroll-area';

const InterviewDetails = ({interview_id }: {interview_id: string}) => {
    const { data } = useQuery({
        queryKey: ['getInterviewRelatedDetails'],
        queryFn: () => getInterviewRelatedDetails(interview_id)
    })

    const Response: { [key: string]: any }[] = data?.data?.data || [{}];
        
  return (
    <ScrollArea className="h-[600px] p-2">
      {Response.length > 0 && Object.entries(Response[0]).map(([key, value], index) => (
        <div 
          key={key}
          className={`flex flex-wrap p-3 ${
            index % 2 === 0 ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-500'
          }`}
        >
          <div className="w-48 font-medium">
            {key} :
          </div>
          <div className="flex-1">
            {value === null ? "null" : value?.toString()}
          </div>
        </div>
      ))}
      </ScrollArea>
  )
}

export default InterviewDetails
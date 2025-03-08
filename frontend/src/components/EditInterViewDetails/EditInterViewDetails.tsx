import { useState } from 'react';
import { cancelInterview, getInterviewRelatedDetails, updateInterview } from '@/service/InterviewService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAllInterviewers } from '@/service/InterViewerService';
import { InterviewData, UpdateInterviewData } from '@/@types/interview';
import { Loader2, Video } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import DateTimePicker from '../custom/DatePicketTime';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface Interviewer {
  id: string;
  username: string;
  email: string;
}

const EditInterViewDetails = ({ interview_id, setIsopen }: { interview_id: string , setIsopen:any}) => {
  const [action, setAction] = useState<string>('');
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>('');
  const [meetLink, setMeetLink] = useState<string>('');
  const [changeReason, setChangeReason] = useState<string>('');

  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['getInterviewRelatedDetails', interview_id],
    queryFn: () => getInterviewRelatedDetails(interview_id)
  });
  
  const { data: InterviewserData } = useQuery({
    queryKey: ['getallInterviewer'],
    queryFn: getAllInterviewers
  });
  
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateInterviewDetails'],
    mutationFn: ({ updatedDetails, Action }: { updatedDetails: UpdateInterviewData, Action: any }) => updateInterview(Action, updatedDetails),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getHRInterviews']});
    },
  })

  const { mutateAsync: CancelMutate, isPending: CancelisPending } = useMutation({
    mutationKey: ['updateInterviewDetails'],
    mutationFn: ({ updatedDetails }: { updatedDetails: UpdateInterviewData }) => cancelInterview(updatedDetails),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getHRInterviews']});
    },
  })

  const response: InterviewData = data?.data?.data[0] || {};
  const interviewers: Interviewer[] = InterviewserData?.data?.data || [];
  
  const [newTime, setNewTime] = useState<string>('');

  const handleActionChange = (value: string) => {
    setAction(value);
  };

  const handleSubmit = () => {
    setIsopen(false);
    switch (action) {
      case 'reschedule':
        toast.promise(
          mutateAsync({
            updatedDetails: {
              interview_id: response.id || '',
              scheduled_at: newTime,
              status_change_reason: changeReason
            },
            Action: 'time' // this actions refers to the routes mean it is in interview/update/action
          }),
          {
            loading: 'Rescheduling interview...',
            success: 'Interview rescheduled successfully!',
            error: 'Failed to reschedule interview.'
          }
        );
        break;
      case 'change_interviewer':
        toast.promise(
          mutateAsync({
            updatedDetails: {
              interview_id: response.id || '',
              interviewer_id: selectedInterviewer,
              status_change_reason: changeReason
            },
            Action: 'intreviewer' // this actions refers to the routes mean it is in interview/update/action
          }),
          {
            loading: 'Updating Interview Details...',
            success: 'Interviewer changed successfully!',
            error: 'Failed to change Interviewer.'
          }
        );
        break;
      case 'change_interviewer_with_Time':
        toast.promise(
          mutateAsync({
            updatedDetails: {
              interview_id: response.id || '',
              scheduled_at: newTime,
              interviewer_id: selectedInterviewer,
              status_change_reason: changeReason
            },
            Action: 'intreviewerandTime' // this actions refers to the routes mean it is in interview/update/action
          }),
          {
            loading: 'Updating Interview Details...',
            success: 'Details changed successfully!',
            error: 'Failed to change Interview Details.'
          }
        );
        break;
      case 'all':
        toast.promise(
          mutateAsync({
            updatedDetails: {
              interview_id: response.id || '',
              interviewer_id: selectedInterviewer,
              scheduled_at: newTime,
              meeting_link: meetLink,
              status_change_reason: changeReason
            },
            Action: 'all' // this actions refers to the routes mean it is in interview/update/action
          }),
          {
            loading: 'Updating Interview Details...',
            success: 'Details changed successfully!',
            error: 'Failed to change Interview Details.'
          }
        );
        break;
      case 'cancel':
        toast.promise(CancelMutate({
          updatedDetails: {
            interview_id: response.id || '',
            status_change_reason: changeReason
          }
        }), 
        {
          loading: 'Cancelling Interview...',
          success: 'Interview Cancelled successfully!',
          error: 'Failed to Cancel Interview.'
        }
      );
        break;
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="space-y-6 px-3 pb-3">
        <div>
          <label className="block text-sm font-medium mb-1">Select Action</label>
          <Select onValueChange={handleActionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose Option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reschedule">Reschedule</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
              <SelectItem value="change_interviewer">Change Interviewer</SelectItem>
              <SelectItem value="change_interviewer_with_Time">Change Interviewer with Time</SelectItem>
              <SelectItem value="all">Update All Details</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditional rendering based on selected action */}
        {(action === 'reschedule' || action === 'all' || action === 'change_interviewer_with_Time') && (
          <div>
            <label className="block text-sm font-medium mb-1">New Interview Time</label>
            <DateTimePicker 
              onDateTimeSelect={setNewTime} 
              minDate={new Date()} 
              className="border rounded-lg"
            />
          </div>
        )}

        {(action === 'meetLink' || action === 'all') && (
          <div>
          <label className="block text-sm font-medium mb-1">New Interview Time</label>
          <div className="space-x-2 flex items-center">
            <Input
              type="text"
              value={meetLink}
              placeholder='Paste New Meet Link'
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full"
            />
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-2 text-blue-600"
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                >
                  <Video className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate Meet</TooltipContent>
              </Tooltip>
            </div>
            </div>
      )
        }

        {(action === 'change_interviewer' || action === 'all' || action === 'change_interviewer_with_Time') && (
          <div>
            <label className="block text-sm font-medium mb-1">Select Interviewer</label>
            <Select onValueChange={setSelectedInterviewer}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Interviewer" />
              </SelectTrigger>
              <SelectContent>
                {interviewers.map((interviewer: Interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    {interviewer.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {action && action !== 'cancel' && (
          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending? <Loader2 className='animate-spin'/> : "Save Changes"}
          </Button>
        )}

        {action === 'cancel' && (
          <div className="text-center p-4 rounded-md">
            <p>Are you sure you want to cancel this interview?</p>
            <div className="mt-4 space-x-4">
              <Button variant="destructive" onClick={() => handleSubmit()} disabled={isPending}>
                {CancelisPending ? <Loader2 className='animate-spin'/>: "Yes, Cancel Interview"}
              </Button>
              <Button variant="outline" onClick={() => setAction('')}>
                No, Go Back
              </Button>
            </div>
          </div>
        )}
        {action && (
          <Textarea 
          value={changeReason}
          onChange={(e) => setChangeReason(e.target.value)}
          placeholder='Please Provide reason for this change'
          />
        )}
      </div>
    </div>
  );
};

export default EditInterViewDetails;
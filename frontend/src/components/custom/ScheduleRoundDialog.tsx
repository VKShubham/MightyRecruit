import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAvailableInterviewer } from '@/service/InterViewerService';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Link, Loader2, Video } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import DateTimePicker from './DatePicketTime';

interface Interviewer {
  id: string;
  username: string;
  email: string;
}

interface ApplicationDetails {
  id: string;
  job_id: string;
  stage_name: string;
}

interface ScheduleRoundDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  application_details?: ApplicationDetails;
  onConfirm: (scheduleDetails: ScheduleDetails) => void;
  isLoading: boolean;
  error: any;
}

interface ScheduleDetails {
  datetime: string;
  interviewerid: string;
  meet_link: string;
}

const ScheduleRoundDialog: React.FC<ScheduleRoundDialogProps> = ({ 
  isDialogOpen, 
  setIsDialogOpen, 
  application_details,
  onConfirm,
  isLoading: propIsLoading,
  error: propError
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState<Date>();
  const [meetLink, setMeetLink] = useState<string>('');
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['getAvailableInterviewers', selectedDateTime],
    queryFn: () => getAvailableInterviewer(selectedDateTime?.toString() || ''),
    enabled: !!selectedDateTime
  });  

  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);

  useEffect(() => {
    if(data) {
      setInterviewers(data.data?.data);
    }
  }, [data]);

  const handleConfirm = (): void => {
    onConfirm({
      datetime: selectedDateTime?.toLocaleString() || '',
      interviewerid: selectedInterviewer,
      meet_link: meetLink
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden rounded-lg border shadow-lg" 
        onInteractOutside={e => e.preventDefault()}
      >
        <div className="bg-primary/5 px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">Schedule Interview</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Select interviewer and date/time for the interview.
              {application_details?.stage_name && !propIsLoading ? (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Next Round: {application_details.stage_name}
                </div>
              ) : !propError ? (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Next Round: <Loader2 className='animate-spin w-3 h-3'/>
                </div>
              ): null}
              {propError && <p>Failed to get details</p>}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-4 space-y-6">
          {/* DateTime Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Select Date and Time</Label>
            <DateTimePicker 
              onDateTimeSelect={setSelectedDateTime} 
              minDate={new Date()} 
              className="border rounded-lg"
            />
          </div>

          {/* Meet Link */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Interview Link</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                onClick={() => window.open('https://meet.google.com/new', '_blank')}
              >
                <Video className="w-4 h-4 mr-1.5" />
                Create Google Meet
              </Button>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-md border border-input px-3 py-2 pl-9 text-sm"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="Paste your meeting link here"
              />
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            {meetLink && (
              <p className="text-xs text-muted-foreground">
                Link will be sent to the candidate and interviewer
              </p>
            )}
          </div>

          {/* Interviewer Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Select Interviewer</Label>
            <Select value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
              {
                isLoading
                ? ( <Skeleton className='w-full h-[35px]' /> )
                : (
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an interviewer" />
                </SelectTrigger>
                )
              }
              <SelectContent>
                <div className="py-2 px-2 text-xs font-medium text-muted-foreground">
                  Available interviewers
                </div>
                {interviewers.map((interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                        {interviewer.username.charAt(0).toUpperCase()}
                      </div>
                      {interviewer.username}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <span className='text-red-600 text-sm'>Failed to get Interviewers</span>}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t flex items-center justify-between">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDateTime || !selectedInterviewer || !meetLink}
            className="px-4"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleRoundDialog;
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInterviewDetails, updateResult } from '@/service/InterviewService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, FileText, Loader2, User, XCircle } from 'lucide-react';
import CandidateDetail from '../CandidateDetail/CandidateDetail';
import { Application } from '@/@types/application';
import { Interview_result, InterviewData } from '@/@types/interview';
import ScreenLoader from '../custom/ScreenLoader';
import ApplicationDetail from '../ApplicationDetail/ApplicationDetail';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-xl ${i < fullStars ? "text-yellow-500" : (i === fullStars && hasHalfStar ? "text-yellow-500 opacity-60" : "text-gray-300")}`}>
          ★
        </span>
      ))}
      <span className="ml-2 text-sm font-medium">{rating}/5</span>
    </div>
  );
};

const FeedBackDetails = ({id, setIsopen}: {id: string, setIsopen: any}) => {
  const [interviewData, setInterviewData] = useState<InterviewData>();
  const [applicationData, setApplicationData] = useState<Application>();

  const { data, isLoading } = useQuery({
    queryKey: ['getInterviewDetails', id],
    queryFn: () => getInterviewDetails(id || ''),
    retry: 2
  });
  
  const queryclient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateResult'],
    mutationFn: ({ interview_id, result }: {interview_id: string, result:Interview_result }) => updateResult({interview_id, result}),
    onSuccess: () => {
        queryclient.invalidateQueries({queryKey: ['getHRInterviews']})
    },
  })

  useEffect(() => {
    if(data) {
      setInterviewData(data.data.data?.Interview);
      setApplicationData(data.data.data?.Application);
    }
  },[data]);

  const feedback = interviewData?.feedback ? JSON.parse(interviewData.feedback) : {};
  
  const handlePass = () => {
    setIsopen(false);
    toast.promise(mutateAsync({ interview_id: id, result: Interview_result.Pass }), {
      loading: 'Sending feedback...',
      success: data => data.data?.message,
      error: data => data.data?.message
    })
  };

  const handleFail = () => {
    setIsopen(false);
    toast.promise(mutateAsync({ interview_id: id, result: Interview_result.Fail }), {
      loading: 'Sending feedback...',
      success: data => data.data?.message,
      error: data => data.data?.message
    })
  };
  
  if(isLoading) {
    return <ScreenLoader />;
  }

  return (
    <ScrollArea className="h-[600px]">
      <div>
        {/* Feedback Card */}
        <Card className="mb-6 shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Interview Feedback</h2>
              <div>{renderStars(feedback.rating || 0)}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="text-md font-medium mb-2 text-gray-700">Notes:</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {feedback.notes || "No feedback notes provided."}
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                By {interviewData?.id || "Unknown Interviewer"}
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleFail} 
                  disabled={isPending}
                  variant="destructive" 
                >
                  <XCircle className="h-4 w-4" />
                  <span>{isPending ? <Loader2 className='animate-spin'/> : "Fail"}</span>
                </Button>
                <Button 
                  onClick={handlePass} 
                  disabled={isPending}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isPending ? <Loader2 className='animate-spin'/> : interviewData?.isFinalRound ? "Hire" : "Pass"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Accordion Sections */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full" defaultValue='item-2'>
            <AccordionItem value="item-1" className="border border-gray-100 rounded-md overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-700">Candidate Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-white">
                <CandidateDetail
                  row={{
                    original: {
                      candidate_id: applicationData?.candidate_id,
                    },
                  }}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-100 rounded-md overflow-hidden mt-3">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-700">Application Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-white">
                <ApplicationDetail
                  row={{
                    original: {
                      application_id: applicationData?.id,
                    },
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </ScrollArea>
  );
};

export default FeedBackDetails;
import { Application } from '@/@types/application';
import { interview_status, InterviewData } from '@/@types/interview';
import { useUser } from '@/app/store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { getInterviewDetails, setInterviewFeedback } from '@/service/InterviewService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Check, FileText, Loader2, MessageSquare, Pencil, Send, ThumbsUp, User, Video } from 'lucide-react';
import { FormEvent, useEffect, useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ApplicationDetail from '../ApplicationDetail/ApplicationDetail';
import CandidateDetail from '../CandidateDetail/CandidateDetail';
import InfoComponent from '../custom/InfoComponet';
import ScreenLoader from '../custom/ScreenLoader';

const InterviewerFeedback = () => {
  const { id } = useParams();
  const ids = useId();
  const navigate = useNavigate();
  const [InterViewData, setInterViewData] = useState<InterviewData>();
  const [ApplicationData, setApplicationData] = useState<Application>();
  const [Rating, setRating] = useState('');
  const queryClient = useQueryClient();
  const removeuser = useUser(state => state.removeUser);

  const { data, isLoading, error } = useQuery({
    queryKey: ['getInterviewDetails', id],
    queryFn: () => getInterviewDetails(id || ''),
    retry: 2
  });


  const [feedbackData, setFeedbackData] = useState({
    notes: ''
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['sendfeedback', id],
    mutationFn: setInterviewFeedback,
    onSuccess: () => {
        // logout();
        queryClient.invalidateQueries({ queryKey: ['getInterviewDetails', id]})
    },
    onError: (error: any) => {
      if((error as AxiosError).status === 403) {
        removeuser();
        navigate(`/login/${id}`);
      }
    },
  })
  
  useEffect(() => {
    if(data) {
        setInterViewData(data.data.data?.Interview);
        setApplicationData(data.data.data?.Application);
    }
  },[data])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const obj = {
        feedbackData: {
            notes: feedbackData.notes || '',
            rating: Rating
        },
        interview_id: id || '',
        selection_pipeline_id: InterViewData?.selection_pipeline_id || '',
        application_id: InterViewData?.application_id || ''
    }
    toast.promise(mutateAsync(obj), {
      loading: 'Sending Feedback...',
      success: 'Feedback Sent!',
      error: 'Failed to Sent Feedback'
    })
  };

  if(isLoading) {
    return <ScreenLoader />
  }    

  if(error) {
    if((error as AxiosError).status === 403) {
      navigate(`/login/${id}`);
    }
    return <InfoComponent title='Something went wrong' message='please check link and try again!' type='error'/>
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl">
      {InterViewData?.status === interview_status.Scheduled ? (
        <div className='p-2 space-y-8'>
          {/* Meeting Link Section */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold text-lg">Meeting Link:</span>
                    <a 
                      target="_blank" 
                      href={InterViewData?.meeting_link} 
                      className="text-white hover:text-blue-100 underline transition-colors"
                    >
                      {InterViewData?.meeting_link}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accordion Sections */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border rounded-lg shadow-md overflow-hidden bg-white">
                <AccordionTrigger className="text-lg font-medium p-4 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-500" />
                    Candidate Details
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t -mt-2 pb-0">
                  <CandidateDetail
                    row={{
                      original: {
                        candidate_id: ApplicationData?.candidate_id,
                      },
                    }}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg shadow-md overflow-hidden bg-white mt-4">
                <AccordionTrigger className="text-lg font-medium p-4 border-b hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Application Details
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t -mt-2 pb-0">
                  <ApplicationDetail
                    row={{
                      original: {
                        application_id: ApplicationData?.id,
                      },
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Feedback Form Section */}
          <Card className="shadow-lg border-0 overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 pb-4">
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Interview Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-blue-600" />
                    Feedback Notes
                  </h3>
                  <Textarea 
                    value={feedbackData.notes}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter your detailed feedback about the candidate here..."
                    className="min-h-40 rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                  
                  <div className="w-full max-w-md mt-8">
                    <fieldset className="space-y-6">
                      <legend className="text-base font-medium flex items-center gap-2 text-blue-800">
                        <ThumbsUp className="w-4 h-4" />
                        How likely are you to recommend hiring this candidate?
                      </legend>
                      <RadioGroup 
                        className="flex gap-0 -space-x-px rounded-lg shadow-lg overflow-hidden" 
                        value={Rating} 
                        onValueChange={setRating}
                      >
                        {["0", "1", "2", "3", "4", "5"].map((value) => (
                          <label
                            key={value}
                            className="relative flex size-12 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border border-blue-100 text-center text-lg font-medium outline-offset-2 transition-colors first:rounded-s-lg last:rounded-e-lg hover:bg-blue-50 has-data-[state=checked]:z-10 has-data-[state=checked]:border-blue-500 has-data-[state=checked]:bg-blue-100 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 has-focus-visible:outline-2 has-focus-visible:outline-blue-500/70"
                          >
                            <RadioGroupItem
                              id={`${ids}-${value}`}
                              value={value}
                              className="sr-only after:absolute after:inset-0"
                            />
                            {value}
                          </label>
                        ))}
                      </RadioGroup>
                    </fieldset>
                    <div className="mt-3 flex justify-between text-sm font-medium text-gray-600">
                      <p className="flex items-center gap-1">
                        <span className="text-xl">😟</span> Not likely
                      </p>
                      <p className="flex items-center gap-1">
                        Very Likely <span className="text-xl">😍</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    disabled={!feedbackData.notes || !Rating}
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 disabled:opacity-70 disabled:scale-100 flex items-center gap-2 shadow-lg"
                  >
                    {isPending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Submit Feedback</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
      
      {InterViewData?.status === interview_status.UnderReview ? (
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center space-y-12 p-10 bg-white rounded-2xl shadow-2xl max-w-2xl transform transition-all animate-fadeIn">
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Check className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Thank You!
              </h2>
              <p className="text-2xl text-gray-600">
                Your interview feedback has been successfully submitted
              </p>
              <div className="pt-4 pb-2">
                <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full"></div>
              </div>
              <p className="text-gray-500">
                The hiring team will review your feedback and proceed with the next steps in the recruitment process.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InterviewerFeedback;
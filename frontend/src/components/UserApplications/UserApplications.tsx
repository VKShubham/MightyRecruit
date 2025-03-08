import { getUserApplications } from '@/service/ApplicationService'
import { useQuery } from '@tanstack/react-query'
import { useJobs } from '../../app/store';
import { useEffect, useState } from 'react'
import ScreenLoader from '../custom/ScreenLoader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowRight, Briefcase, Building2, Calendar, CheckSquare, Clock, ThumbsUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { Application, Application_status } from '@/@types/application';
import InfoComponent from '../custom/InfoComponet';
import { Interview_result, interview_status } from '@/@types/interview';

type TrackData = {
  interview_title?: string;
  interview_status?: interview_status;
  interview_result?: Interview_result;
}

interface UsersApplication extends Application {
  tracking: TrackData[]
}

const UserApplications = () => {

  // React router variables
  const navigate = useNavigate();

  // Page state Variables
  const [applications, setApplications] = useState<UsersApplication[]>([]);
  
  // zustand state variables
  const jobs = useJobs(state => state.jobs);
  
  const { data, isLoading } = useQuery({
    queryKey: ['userApplications'],
    queryFn: getUserApplications
  })

  // it will give an color accordiang to the status
  const getStatusColor = (status: Application_status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'in process':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'hired':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
    }
  };

  useEffect(() => {
    if(data) {
      const mergedData = data?.data?.data?.map((application: UsersApplication) => {
        return  {
          ...application,
          jobdetail: jobs.find((job) => job.id === application.job_id)
        }
      }) 
      setApplications(mergedData);
    }
  },[data])
  
  if(isLoading) return <ScreenLoader />
  if(!applications) return <InfoComponent message="don't have any active applications" type='warning' title='No Applications Found' />
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold">Your Applications</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
      <div>
        <Accordion type="single" collapsible className="space-y-4">
        {
          applications?.map((application, index) => (
            <AccordionItem key={index} value={index.toString()}>
              <Card>
              <AccordionTrigger className="px-3 py-3 sm:px-5 sm:py-4 hover:no-underline">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-1">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <div className="text-left">
                    <h3 className="font-semibold text-sm sm:text-base">{application.jobdetail.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{application.jobdetail.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-6 mt-2 sm:mt-0 ml-7 sm:ml-0">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {new Date(application.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                    {application.status}
                  </Badge>
                </div>
              </div>
              </AccordionTrigger>
              <AccordionContent>
                  <div className="px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="mb-1 text-xs sm:text-sm">Department</Label>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{application.jobdetail.department}</span>
                        </div>
                      </div>
                      <div>
                        <Label className= "mb-1 text-xs sm:text-sm">Applied On</Label>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{new Date(application.applied_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className= "mb-1 text-xs sm:text-sm">Job Description</Label>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 editor-content" dangerouslySetInnerHTML={{__html: application.jobdetail.description}}/>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <Label className="text-xs sm:text-sm font-medium">Application Tracking</Label>
                      {application?.tracking && Array.isArray(application.tracking) && application.tracking?.length > 0 ? (
                        <Card className="mt-2 sm:mt-4 shadow-sm border">
                          <div className="divide-y">
                            {application.tracking.map((track, idx) => (
                              <div key={idx} className="p-3 sm:p-4 transition-colors duration-200">
                                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                                  <div className="p-1 sm:p-2 rounded-lg">
                                    <CheckSquare className="w-3 h-3 sm:w-5 sm:h-5 text-blue-500" />
                                  </div>
                                  <h4 className="font-semibold text-xs sm:text-sm">
                                    {track.interview_title || 'Interview'}
                                  </h4>
                                </div>
                                
                                <div className="ml-6 sm:ml-12 space-y-2 sm:space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="text-xs sm:text-sm">Status</span>
                                    </div>
                                    <Badge 
                                      variant={track.interview_status === interview_status.Cancelled ? 'destructive' 
                                        : track.interview_status === interview_status.Completed ? 'success' : 'pending' 
                                      }
                                    >
                                      {track.interview_status || 'Pending'}
                                    </Badge>
                                  </div>
                                  
                                  {track.interview_status === 'Completed' && (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2 text-gray-600">
                                        <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="text-xs sm:text-sm">Result</span>
                                      </div>
                                      <Badge 
                                      variant={track.interview_result === 'Pass' ? 'success' 
                                        : 'destructive'
                                      }
                                    >
                                        {track.interview_result}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ) : (
                        <div className="text-xs sm:text-sm mt-2 p-3 sm:p-4 rounded-lg border text-center">
                          No tracking information available
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={() => navigate(`/${application.job_id}`)}
                        className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
                        size="sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))
        }
        </Accordion>
      </div>
    </CardContent>
    </Card>
  )
}

export default UserApplications
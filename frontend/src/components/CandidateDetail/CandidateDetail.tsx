import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCandidateDetails } from '@/service/CandidateService';
import { Candidate } from '@/@types/candidate';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Briefcase, GraduationCap, Mail, MapPin, Phone, FileText, StickyNote } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import CandidateDetailSkeleton from '../Skeletons/CandidateDetailsSkeleton';
import InfoComponent from '../custom/InfoComponet';
import PDFViewer from '../custom/PDFViewer';

interface CandidateDetailProps {
  row: {
    original: any;
  };
}

const CandidateDetail = ({row} : CandidateDetailProps) => {
    const [candidate, setCandidate] = useState<Candidate>();
    console.log(candidate?.resume_url);
    
    const { data, isLoading, isError } = useQuery({
      queryKey: ['getCandidateDetail', row.original.candidate_id],
      queryFn: () => getCandidateDetails(row.original.candidate_id),
      enabled: !!row.original.candidate_id,
      staleTime: 60 * 10 * 1000,
    });

    useEffect(() => {
      if(data) {
        setCandidate(data.data?.data);
      }
    }, [data]);
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    };

    if (isLoading || !candidate) {
      return (
        <div className="w-full mx-auto p-4">
          <CandidateDetailSkeleton />
        </div>
      );
    }
    

    if(isError) {
      <InfoComponent title='Error' type='error' message='Something went wrong please try again!' />
    }

    return (
      <div className="w-full mx-auto">
        <Card className="border-none shadow-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-linear-to-br from-blue-400 to-blue-600 p-8 rounded-t-xl">
              <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                <Avatar className="h-20 w-20 ring-4 ring-white/50">
                  <AvatarImage 
                    src={candidate?.profile_picture_url} 
                    alt={`${candidate?.firstname} ${candidate?.lastname}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-white text-blue-600">
                    {`${candidate?.firstname?.[0]}${candidate?.lastname?.[0]}`}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <h1 className="text-md md:text-2xl font-bold">{`${candidate?.firstname} ${candidate?.lastname}`}</h1>
                  <div className="mt-2 space-y-1 text-blue-100 text-md">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{candidate?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{candidate?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{`${candidate?.address.state}, ${candidate?.address.city}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    
            {/* Salary */}
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <div className="text-sm text-gray-500">Current Salary</div>
                <div className="text-sm md:text-lg font-semibold">₹{candidate?.current_salary}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Expected Salary</div>
                <div className="text-sm md:text-lg font-semibold">₹{candidate?.expected_salary}</div>
              </div>
            </div>
    
            <div className="p-4 space-y-6">
              {/* Skills */}
              <div>
                <h2 className="text-[15px] md:text-lg font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                {
                  candidate?.skills.map((skill, index) => (
                    <Badge key={index} className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                      <span className=''>{`${skill.name} • ${skill.rating}`}</span>
                    </Badge>
                  ))
                } 
                </div>
              </div>
    
              <Separator />
    
              {/* Experience */}
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold mb-4 md:text-lg">
                  <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                  Experience
                </h2>
                <div className='space-y-4'>
                  {
                    candidate?.work_experience.map((experience, index) => (
                      <div key={index} className="pl-2 border-l-2 border-blue-200 md:pl-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-sm md:text-lg">{experience.industryname}</h3>
                            <span className="text-blue-600 text-sm md:text-lg">{experience.designation}</span>
                          </div>
                          <span className="text-gray-500 text-[10px] md:text-sm mt-auto mb-1">
                            {`${formatDate(experience.startDate)} - ${formatDate(experience.endDate)}`}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600">{experience.description}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
    
              <Separator />
    
              {/* Education */}
              <div>
                <h2 className="flex items-center gap-2 font-semibold mb-4 md:text-lg">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                  Education
                </h2>
                <div className="space-y-4">
                  {
                    candidate?.education.map((education, index) => (
                      <div key={index} className="pl-2 border-l-2 border-blue-200 md:pl-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-sm md:text-lg">{education.level.toUpperCase()}</h3>
                            <span className="text-sm md:text-lg text-blue-600 block">{education.institution}</span>
                            <span className="text-gray-500 text-[12px] md:text-sm">{education.percentage} %</span>
                          </div>
                          <div className="text-gray-500 text-[10px] md:text-sm mt-auto mb-1">
                            {`${formatDate(education.startDate)} - ${formatDate(education.endDate)}`}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <Separator />

              {/* Resume Section */}
              <div>
                <h2 className="flex items-center gap-2 font-semibold mb-4 md:text-lg">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                  Resume
                </h2>
                <div className="rounded-lg border border-accent bg-background">
                  <PDFViewer 
                  src={candidate?.resume_url}
                  />
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-2 font-semibold mb-4 md:text-lg">
                  <StickyNote className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                  Notes
                </h2>
                <div className="w-full rounded-lg border border-accent bg-background p-4">
                  {candidate?.notes ? (
                    <div className="space-y-2">
                      {candidate.notes}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      No notes available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
};

export default CandidateDetail;
import { useJobs, useUser } from '@/app/store';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Building2, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CreateApplication } from '@/service/ApplicationService';
import { daysAgo } from '@/util/moment';
import { Job } from '@/@types/job';
import { isCandidate } from '@/service/CandidateService';

const JobDetail: React.FC = () => {
   // React Router Variables
  const navigate = useNavigate();

  // Page State Variables
  const [isdialogOpen, setisdialogOpen] = useState(false)

  // zustand state variables
  const jobs = useJobs(state => state.jobs as Job[]);
  const user = useUser(state => state.user);

  // it gets job id from an params
  const { id } = useParams<{id: string}>();
  // Check if id is a valid UUID, if not navigate to home page
  React.useEffect(() => {
    // UUID validation regex pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!id || !uuidPattern.test(id)) {
      toast.error("Invalid job ID");
      navigate('/');
    }
  }, [id, navigate]);

  // get the job (using jobid) from an list of an jobs
  const job = jobs.filter(j => j.id === id)[0];

  // calculate the days from when job is created
  const days = daysAgo(job?.created_at);

  //  Muatation function for createApplication for an job
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['createapplication',user?.id, id],
    mutationFn: CreateApplication,
    onSuccess: () => {
        navigate('/userApplications')
    }
  })

  // getting info we had candidate details
  const { data, isLoading } = useQuery({
    queryKey: ['isCandidate'],
    queryFn: isCandidate
  })
  
  // Function triggred when user press apply button
  const handleapply = () => {
    if(isLoading) {
      toast.loading("Fetching details...");
    }
    toast.dismiss();
    if(user?.id == null) {
        navigate('/login');
        return;
    }
    else if(!data?.data.isCandidate) {
      navigate(`/profile`)
      return;
    }
    setisdialogOpen(true)
  }

  // AlertDialog continue button Triggred
  const handlecontinue = () => {
    if(id) {
        toast.promise(mutateAsync(id), {
          loading: 'Applying for a job...',
          success: data => data.data.message,
          error: data => data.response.data.message || data?.message || 'Failed to apply'
        })
    }
  }

  return (
    <div className="w-full mx-auto p-4 space-y-6 dark:bg-background">
  {/* Header Card */}
  <Card className="border-none shadow-lg dark:bg-card dark:shadow-gr">
    <CardHeader className="pb-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Badge variant="default">
            {job?.shift_type}
          </Badge>
          <CardTitle className="text-2xl font-bold text-primary">
            {job?.title}
          </CardTitle>
          <div className="flex flex-wrap gap-4 text-sm dark:text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{job?.state}, {job?.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{days === 0 ? "Today" : `${days} days ago`}</span>
            </div>
          </div>
        </div>
        <Button size="lg" className="hidden lg:flex md:flex" onClick={handleapply} disabled={isPending}>
          Apply Now
        </Button>
      </div>
    </CardHeader>

    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-lg  dark:shadow-gray-500">
      <div className="space-y-1">
        <div className="text-sm font-medium dark:text-muted-foreground">Salary Range</div>
        <div className="font-semibold dark:text-foreground">{job?.salary_range}</div>
        <div className="text-sm dark:text-muted-foreground">Annually</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium dark:text-muted-foreground">Experience</div>
        <div className="font-semibold dark:text-foreground">{`${job?.work_experience}+ years`}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium dark:text-muted-foreground">Shift Type</div>
        <div className="font-semibold dark:text-foreground">{job?.shift_type}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium dark:text-muted-foreground">Work Mode</div>
        <div className="font-semibold dark:text-foreground">{job?.work_mode}</div>
      </div>
    </CardContent>
  </Card>

  {/* Details Cards */}
  <div className="grid grid-cols-1 gap-6">
    <Card className="border-none shadow-lg dark:bg-card">
      <CardContent className="p-6 space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold dark:text-foreground">About the Company</h3>
          </div>
          <p className="leading-relaxed text-justify dark:text-muted-foreground">
            Our company specializing in technology products that provide real-time solutions. With fully functional R&D labs, we focus on domains such as IoT, energy savings, robotics, consumer and industrial applications, machine analytics, access systems, and security technologies. Our mission is to deliver efficient, cost-effective solutions with minimal human interference, upholding values of transparency, integrity, dedication, passion, commitment, and timeliness.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold dark:text-foreground">Job Description</h3>
          </div>
          <div 
            dangerouslySetInnerHTML={{__html: job?.description}} 
            className="editor-content dark:text-muted-foreground" 
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold dark:text-foreground">Requirements</h3>
          </div>
          <div 
            dangerouslySetInnerHTML={{__html: job?.requirements}} 
            className="editor-content dark:text-muted-foreground" 
          />
        </section>
        <div className='flex lg:hidden md:hidden justify-center h-fit'>
          <Button 
            size="lg" 
            onClick={handleapply} 
            className="mb-24" 
            disabled={isPending}
          >
            {isPending && <Loader2 className='animate-spin'/>}
            {isPending ? '' : 'Apply Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
  <AlertDialog open={isdialogOpen} onOpenChange={setisdialogOpen}>
    <AlertDialogContent className="dark:bg-card dark:border-border">
      <AlertDialogHeader>
        <AlertDialogTitle className="dark:text-foreground">Are you sure you want to apply for this job?</AlertDialogTitle>
        <AlertDialogDescription className="dark:text-muted-foreground">
          This action cannot be undone. 
          Once you apply, your application will be submitted for review.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handlecontinue}>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>
  );
}

export default JobDetail
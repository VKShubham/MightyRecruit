import { getJobStats, getRecentJobs } from "@/service/JobService"
import { useQueries } from "@tanstack/react-query"
import HRDashboardSkeleton from "../Skeletons/HRDashboardSkeleton";
import InfoComponent from "../custom/InfoComponet";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  BriefcaseIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  ChevronUpIcon, 
  Clipboard, 
  ClockIcon, 
  DollarSignIcon, 
  FileTextIcon, 
  MapPinIcon, 
  TrendingUpIcon, 
  UsersIcon, 
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { getHiringTrends } from "@/service/ApplicationService";
import { Button } from "../ui/button";
import { getUpcomingInteviews } from "@/service/InterviewService";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { job_status } from "@/@types/job";
import { Badge } from "../ui/badge";
import { daysAgo } from "@/util/moment";
import JobEdit from "../JobEdit/JobEdit";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tooltip as ShadcnToolTip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { AxiosError } from "axios";
import { useUser } from "@/app/store";
import { Separator } from "../ui/separator";

interface Stats {
    name: string;
    value: string;
    icon: React.ReactNode;
    change: string;
    iconClassName: string;
}

interface Trend {
    month: string;
    applications: string;
    hired: string;
}

interface Interview {
    time: string;
    candidate: string;
    role: string;
    avatar: string;
}

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    salary: string;
    applications: string;
    posted: string;
    status: job_status;
}

const HRDashboard = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [job_id, setjob_id] = useState('');
    const navigate = useNavigate();
    const removeuser = useUser(state => state.removeUser);

    // fetch all data
    const result = useQueries({
        queries: [
            {
                queryKey: ['getJobStats'],
                queryFn: getJobStats
            },
            {
                queryKey: ['getHiringTrends'],
                queryFn: getHiringTrends
            },
            {
                queryKey: ['getUpComingInterview'],
                queryFn: getUpcomingInteviews
            },
            {
                queryKey: ['getRecentJobs'],
                queryFn: getRecentJobs
            },
        ]
    });

    const [JobStatsQuery, HiringtrendsQuery, UpComingIntrviewQuery, RecentJobsQuery] = result as any;    

    useEffect(() => {
      if (JobStatsQuery.error) {
        const error = JobStatsQuery.error as AxiosError;
        if (error.response?.status === 403) {
          removeuser();
          navigate('/login');
        }
      }
    }, [JobStatsQuery.error, removeuser, navigate]);    

    if(JobStatsQuery.isLoading || HiringtrendsQuery.isLoading || UpComingIntrviewQuery.isLoading || RecentJobsQuery.isLoading) 
      return <HRDashboardSkeleton />
      
    if(JobStatsQuery.error || HiringtrendsQuery.error || UpComingIntrviewQuery.error || RecentJobsQuery.error) 
      return <InfoComponent type="error" message="Please try again after some time" title="Something went wrong"/>


    const jobStats: Stats[] = [
        {
            name: 'Total Jobs',
            icon: <Clipboard className="h-5 w-5" />,
            iconClassName: "text-primary",
            value: JobStatsQuery.data?.data?.stats?.total_jobs,
            change: JobStatsQuery.data?.data?.stats?.job_increment,
        },
        {
            name: 'Applications',
            icon: <FileTextIcon className="h-5 w-5" />,
            iconClassName: "text-chart-1",
            value: JobStatsQuery.data?.data?.stats?.total_applications,
            change: JobStatsQuery.data?.data?.stats?.application_increment
        },
        {
            name: 'Interviews',
            icon: <CalendarIcon className="h-5 w-5" />,
            iconClassName: "text-chart-2",
            value: JobStatsQuery.data?.data?.stats?.total_interviews,
            change: JobStatsQuery.data?.data?.stats?.interview_increment
        },
        {
            name: 'Hired',
            icon: <CheckCircleIcon className="h-5 w-5" />,
            iconClassName: "text-chart-3",
            value: JobStatsQuery.data?.data?.stats?.total_hired,
            change: JobStatsQuery.data?.data?.stats?.hired_increment
        },
    ];

    const hiringTrends: Trend[] = HiringtrendsQuery.data?.data?.data || [];
    const upcomingInterviews: Interview[] = UpComingIntrviewQuery.data?.data?.data || [];
    const recentJobs: Job[] = RecentJobsQuery.data?.data?.jobs || [];
    
    return (
      <div className="p-6 space-y-8 bg-background min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jobStats.map((stat: Stats, index: number) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className={`p-2 rounded-md bg-muted ${stat.iconClassName}`}>
                    {stat.icon}
                  </div>
                    <ShadcnToolTip>
                      <TooltipTrigger>
                        <div className="flex items-center text-sm font-medium text-green-400">
                        <ChevronUpIcon className="h-4 w-4 mr-1" />
                        +{stat.change}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>Last 7 days</TooltipContent>
                    </ShadcnToolTip>
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>  

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hiring Trends Chart */}
          <Card className="shadow-md border-none lg:col-span-2">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                <ShadcnToolTip>
                  <TooltipTrigger>
                  <CardTitle className="text-lg font-semibold flex items-center">
                      <TrendingUpIcon className="mr-2 h-5 w-5 text-blue-500" />
                      Hiring Trends
                  </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>
                    Last 1 year
                  </TooltipContent>
                </ShadcnToolTip>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hiringTrends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#334155" />
                    <YAxis stroke="#334155" />
                    <Tooltip 
                    contentStyle={{ 
                        backgroundColor: "rgba(31, 41, 55, 0.9)", 
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        color: "#f1f5f9"
                    }}
                    />
                    <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hired" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

          {/* Upcoming Interviews */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {
                 upcomingInterviews.length > 0 ? (
                  <>
                    <ul className="space-y-4">
                      {upcomingInterviews.map((interview, index) => (
                        <li key={index} className="bg-card rounded-lg p-4 shadow-sm border">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 bg-secondary text-secondary-foreground font-medium">
                              <AvatarImage 
                                src={`http://localhost:3000/${interview.avatar}`}
                                alt={interview.candidate}
                              />
                              <AvatarFallback>
                                {`${interview.candidate[0]}${interview.candidate.split(' ')[1]?.[0] || ''}`}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">{interview.candidate}</h3>
                              <p className="text-sm text-muted-foreground">{interview.role}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4 mr-1 text-chart-3" />
                            {new Date(interview.time).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 text-primary hover:bg-secondary" 
                      onClick={() => navigate(`/hr/manage-interviews`)}
                    >
                      View All Interviews
                    </Button>
                  </>
                 ) : (
                  <div className="w-full py-10 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                        <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <h3 className="font-medium text-foreground">No Upcoming Interviews</h3>
                      <p className="text-sm text-muted-foreground">Your schedule is clear. When interviews are booked, they'll appear here.</p>
                    </div>
                  </div>
                 )
              }
            </CardContent>
          </Card>
        </div>

        {/* Recently Posted Jobs */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center">
                <BriefcaseIcon className="mr-2 h-5 w-5 text-primary" />
                Recently Posted Jobs
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:bg-secondary"
                onClick={() => navigate('/hr/managejob')}
              >
                View All Jobs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid gap-4">
                {recentJobs?.map((job, index) => (
                  <div 
                    key={index} 
                    className="bg-background rounded-lg p-5 shadow-sm hover:shadow transition-all duration-200 border"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground text-lg">{job.title}</h3>
                          <Badge 
                            variant={job.status === job_status.Active ? 'success' : 'destructive'} 
                            className="text-xs"
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.department}</p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <DollarSignIcon className="w-3 h-3 mr-1" />
                            {job.salary}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <UsersIcon className="w-3 h-3 mr-1" />
                            {job.applications} Applications
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Posted {daysAgo(job.posted)} days ago
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-center">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-muted-foreground"
                          onClick={() => {
                            setIsDialogOpen(true)
                            setjob_id(job.id);
                          }
                          }
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="lg:min-w-[1100px] p-0" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="pb-0 px-2">
              <DialogTitle className="pt-4">Edit Job Details</DialogTitle>
            </DialogHeader>
            <Separator className="my-0 py-0" />
            <div className="">
              <JobEdit id={job_id} setIsDialogOpen={setIsDialogOpen}/>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
};

export default HRDashboard;
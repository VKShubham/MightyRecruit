import { Job, job_status } from '@/@types/job';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getJobs } from '@/service/JobService';
import { daysAgo } from '@/util/moment';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../app/store';
import ScreenLoader from '../custom/ScreenLoader';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const addJob = useJobs(state => state.addJobs);

  const { data, isLoading } = useQuery({
    queryKey: ['getJobs'],
    queryFn: getJobs,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (data) {
      addJob(data.data?.jobs?.filter((job: Job) => job.status === job_status.Active));
    }
  }, [data]);

  const jobs: Job[] = data?.data?.jobs || [];

  // Get unique departments
  const departments = ['All', ...new Set(jobs.map(job => job.department))];

  const handleClick = (id: string) => {
    navigate(`${id}`);
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  const filteredJobs = jobs
    .filter(job => {
      const matchesType = typeFilter === 'All' || job.shift_type === typeFilter;
      const matchesDepartment = departmentFilter === 'All' || (job.department) === departmentFilter;
      const matchesSearch = searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.department).toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.state.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesDepartment && matchesSearch;
    });

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-12">
          <h1 className="text-4xl text-primary font-bold mb-4 text-center">
            Be part of our mission
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            We're looking for passionate people to join us on our mission. We value
            flat hierarchies, clear communication, and full ownership and responsibility.
          </p>

          <div className="flex flex-col gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for jobs, departments, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap ml-auto">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Department</span>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type</span>
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Positions</SelectItem>
                      <SelectItem value="Full Time">Full time</SelectItem>
                      <SelectItem value="Part Time">Part time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job, index) => (
            <Card
              key={index}
              onClick={() => handleClick(job.id)}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {job.shift_type}
                      </Badge>
                      <Badge variant="outline" className="border-muted">
                        {job.department || 'Engineering'}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.state}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Posted {daysAgo(job.created_at) === 0 ? "Today" : `${daysAgo(job.created_at)} days ago`}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-primary hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Position →
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-medium mb-2">No positions found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Jobs;
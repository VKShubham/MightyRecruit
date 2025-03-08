import { Job, job_status, shift_type, work_mode } from "@/@types/job"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EditJobSchema } from '@/schema'
import { GetJobById, UpdateJob } from "@/service/JobService"
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { City, Country, State } from "country-state-city"
import { SetStateAction, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from 'sonner'
import TipTap from "../custom/TipTap/TiptapEditor"
import EditJobSkeleton from '../Skeletons/EditJobSkeleton'
import { ScrollArea } from '../ui/scroll-area'

export type EditJobType = {
  job_id: string;
  city: string;
  country: string;
  state: string;
  description: string;
  requirements: string;
  salary_range: string;
  shift_type: shift_type;
  department: string;
  status: job_status;
  work_expierence: string;
  title: string;
  total_vacancy: string;
  work_mode: work_mode;
};

const JobEdit = ({id, setIsDialogOpen}: {id: string, setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>}) => {

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['getJobDetails',id],
    queryFn: () => GetJobById(id),
    enabled: !!id
  });

  const { mutateAsync } = useMutation({
    mutationFn: (updatedJob: EditJobType) => UpdateJob(updatedJob),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getRecentJobs']})
      queryClient.invalidateQueries({queryKey: ['getJobs']})
      queryClient.invalidateQueries({queryKey: ['getAllJobs']})
      queryClient.invalidateQueries({queryKey: ['getJobDetails',id]})
    }
  });
  
  const form = useForm<any>({
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      department: "" as "HR" | "R&D" | "Electronics" | "Production" | "Sales" | "Account" | "HouseKeeping" | undefined,
      salary_range: "",
      shift_type: "",
      work_mode: "",
      work_expierence: "",
      total_vacancy: "",
      city: "",
      state: "",
      country: "",
      status: ""
    },
    resolver: zodResolver(EditJobSchema)
  });

  const job: Job = data?.data?.job;

  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        department: (job.department as "HR" | "R&D" | "Electronics" | "Production" | "Sales" | "Account" | "HouseKeeping") || "HR",
        salary_range: job.salary_range || "",
        shift_type: job.shift_type || "Full Time",
        work_mode: job.work_mode || "Remote",
        work_expierence: job.work_experience?.toString() || "",
        total_vacancy: job.total_vacancy?.toString() || "",
        city: job.city || "Surat",
        state: job.state || "Gujarat",
        country: job.country || "India",
        status: job.status || "",
      });
    }
  }, [job]);

  const countries = useMemo(() => Country.getAllCountries(), []);

  const selectedCountry = form.watch('country');
  const selectedState = form.watch('state');
  
  const states = useMemo(() => {
    if (!selectedCountry) return [];
    const countryData = countries.find((c) => c.name === selectedCountry);
    if (!countryData) return [];
    return State.getStatesOfCountry(countryData.isoCode);
  }, [selectedCountry, countries]);
  
  const cities = useMemo(() => {
    if (!selectedState || !selectedCountry) return [];
    const countryData = countries.find((c) => c.name === selectedCountry);
    const stateData = states.find((s) => s.name === selectedState);
    if (!countryData || !stateData) return [];
    return City.getCitiesOfState(countryData.isoCode, stateData.isoCode);
  }, [selectedState, selectedCountry, states]);
  
  
  if(isLoading) return <EditJobSkeleton />

  const onSubmit = async (values: any) => {
    setIsDialogOpen(false);
    toast.promise(mutateAsync({
      ...values,
      job_id: id
    }),
    {
      loading: 'Updating a Details...',
      success: data => data.data.message,
      error: data => data.data.message
    }
  )
  };

  return (
    <ScrollArea className="h-[550px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || job?.department}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="R&D">R&D</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Account">Account</SelectItem>
                        <SelectItem value="HouseKeeping">HouseKeeping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter salary range" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_expierence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Experience (Years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || job.work_mode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || job.shift_type}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || job?.country}
                          onValueChange={(val) => {
                            field.onChange(val)
                          }}
                        >
                          <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.isoCode} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || job?.state}
                          onValueChange={(val) => {
                            field.onChange(val)
                          }}
                        >
                          <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((country) => (
                            <SelectItem key={country.isoCode} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || job?.city}
                          onValueChange={(val) => {
                            field.onChange(val)
                          }}
                        >
                          <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((country) => (
                            <SelectItem key={country.name} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_vacancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Vacancies</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || job?.status}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description and Requirements Section */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TipTap 
                        description={field.value || job?.description}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                    <TipTap 
                        description={field.value || job?.requirements}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end z-1 space-x-4 fixed bottom-0 right-0 p-4">
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default JobEdit;
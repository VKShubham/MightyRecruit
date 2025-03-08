import { CreateJobForm } from '@/@types/job';
import { jobSchema } from '@/schema';
import { createJob } from '@/service/JobService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { City, Country, ICity, ICountry, IState, State } from 'country-state-city';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import TipTap from '../custom/TipTap/TiptapEditor';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import RoundField from './RoundField';

const CreateJob: React.FC = () => {

    // react router variables
    const navigate = useNavigate();

    // react hook form intialization
    const form = useForm<any>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: "",
            description: "",
            requirements: "",
            department: "",
            work_expierence: "",
            status: "",
            salary_range: "",
            shift_type: "",
            city: "",
            country: "",
            state: "",
            work_mode: "",
            total_vacancy: "",
            total_hired: "",
            selection_process: [
                {
                    stage_name: '',
                    sequence: '1'
                }
            ]
        }
    });

    // useMutation Function to create a Job
    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['createJob'],
        mutationFn: createJob,
        onSuccess: (response) => {
            if(response.status === 200) {
                form.reset();
                navigate('/hr/managejob')
                toast.success('Job Created Succesfully')
            }
            else {
                toast.error('Failed to Create Job Try Again!')
            }
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })

    // Form submission function
    const onSubmit = (data: CreateJobForm) => {
        toast.promise(mutateAsync(data), {
            loading: 'Posting a Job...',
            success: 'Job Posted Successfully',
            error: error => error.message || 'Failed to Post a Job'
        })
    }

    const [countries, setCountries] = React.useState<ICountry[]>([]);
    const [states, setStates] = React.useState<IState[]>([]);
    const [cities, setCities] = React.useState<ICity[]>([]);

    const loadCountries = () => {
        if (countries.length === 0) {
            setCountries(Country.getAllCountries());
        }
    };

    const loadStates = (selectedCountry: string) => {
        const countryData = countries.find((c) => c.name === selectedCountry);
        if (countryData) {
            setStates(State.getStatesOfCountry(countryData.isoCode));
        }
    };
    
    const loadCities = (selectedState: string, selectedCountry: string) => {
        const countryData = countries.find((c) => c.name === selectedCountry);
        const stateData = states.find((s) => s.name === selectedState);
        if (countryData && stateData) {
            setCities(City.getCitiesOfState(countryData.isoCode, stateData.isoCode));
        }
    };
    

  return (
    <div className="flex p-1">
         <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-[23px] font-semibold">Create Job</CardTitle>
            </CardHeader>
            <CardContent> 
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>

                    {/* Job Title and Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Job Title" {...field} />
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
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select job department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="R&D">R&D</SelectItem>
                                            <SelectItem value="Electronics">Electronics</SelectItem>
                                            <SelectItem value="Production">Production</SelectItem>
                                            <SelectItem value="HR">HR</SelectItem>
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

                    {/* Job Descreption */}
                    <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <TipTap onChange={field.onChange} description={field.value}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    {/* Job Reuirements */}
                    <FormField
                            control={form.control}
                            name="requirements"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Requirements</FormLabel>
                                    <FormControl>
                                        <TipTap description={field.value} onChange={field.onChange}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    {/* Work Experience and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="work_expierence"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experience <span className='text-sm text-gray-500'>(required for job)</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter in Years" type="number" {...field} />
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
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select job status" />
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
    
                    {/* salary_range and shift_type */}
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
                            name="shift_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shift Type</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select shift type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Full Time">Full Time</SelectItem>
                                            <SelectItem value="Part Time">Part Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
    
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
                                    value={field.value}
                                    onOpenChange={loadCountries}
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
                                    value={field.value}
                                    onOpenChange={() => loadStates(form.watch("country"))}
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
                                    value={field.value}
                                    onOpenChange={() => loadCities(form.watch("state"), form.watch("country"))} 
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
                    
                    {/* total_hired, total_vacencies and work_mode */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2'>
                    <FormField
                        control={form.control}
                        name="total_vacancy"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Vacancy</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" placeholder="Enter job vacancy" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="total_hired"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Hired</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" placeholder="Enter total hired as of now"{...field} />
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
                            <FormLabel>Work Location</FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select work mode" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="On-site">Onsite</SelectItem>
                                    <SelectItem value="Work From Home">Work From Home</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <RoundField form={form} />
                    <Button type="submit" className="w-full">
                        {isPending && <Loader2 className='animate-spin'/>}
                        {isPending ? '' : 'Create Job'}
                    </Button>
                    </form>
                </Form>
            </CardContent>
         </Card>
    </div>
  )
}

export default CreateJob
import { useUser } from '@/app/store';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RegisterFormSchema } from '@/schema';
import { getProfileDetails, registerCandidate } from '@/service/CandidateService';
import { StringtoDate } from '@/util/date';
import { resetFormWithUserData } from '@/util/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { City, Country, State } from "country-state-city";
import { Award, Briefcase, DollarSign, Edit2, GraduationCap, Link, Plus, RotateCcw, SaveIcon, Trash2, Upload } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import ProfileSkeleton from '../Skeletons/ProfileSkeleton';
import PDFViewer from '../custom/PDFViewer';
import StarComponet from '../custom/Star';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
interface Education {
  level: string;
  institution: string;
  startDate: string;
  endDate: string;
  percentage: string;
}

interface Experience {
  industryname: string;
  designation: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  name: string;
  rating: number;
}

export interface FormValues {
  username: string;
  firstname: string;
  notes: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  date_of_birth: string;
  resume_url: string;
  profile_picture_url: string;
  linkedin_url?: string;
  github_url?: string;
  current_salary: number;
  expected_salary: number;
  education: Education[];
  work_experience: Experience[];
  skills: Skill[];
  address: {
    address: string;
    country: string;
    city: string;
    state: string;
  };
}

const Profile = () => {
  const user = useUser(state => state.user);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false); // form is editing state
  const skillName = useRef<HTMLInputElement>(null); // for mananging the skill field when users add skill 
  
  const [files, setFiles] = useState<{ resume_url: File | null; profile_picture_url: File | null }>({
    resume_url: null,
    profile_picture_url: null,
  }); // for resume and profile picture
  
  // getting a profile details
  const { data, isLoading } = useQuery({
    queryKey: ['getProfileDetails'],
    queryFn: getProfileDetails,
    enabled: !!user
  });

  const userData: FormValues = React.useMemo(() => data?.data?.data, [data])

  const form = useForm<any>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username:"",
      firstname:"",
      date_of_birth:"",
      lastname:"",
      email:"",
      phone:"",
      profile_picture_url:"",
      resume_url:"",
      linkedin_url:"",
      github_url:"",
      current_salary:0,
      expected_salary:0,
      address: {
        address: "",
        city: "",
        country: "",
        state: "",
      },
      education:[{
        level: "",
        institution: "",
        startDate: "",
        endDate: "",
        percentage: ""
      }],
      work_experience:[{
        industryname: "",
        designation: "",
        startDate: "",
        endDate: "",
        description: ""
      }],
      skills:[]
    }
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education"
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: "work_experience"
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skills"
  });

  const watchedSkills = useWatch({
    control: form.control,
    name: "skills"
  });

  const { mutateAsync } = useMutation({
    mutationFn: registerCandidate,
    mutationKey: ['register'],
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getProfileDetails']})
    }
  })

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
    } else {
        formData.append(key, value.toString());
    }
    })
    if (files.resume_url) formData.append("resume_url", files.resume_url);
    if (files.profile_picture_url) formData.append("profile_picture_url", files.profile_picture_url);
    toast.promise(mutateAsync(formData), {
      loading: 'Loading...',
      success: 'Successfully Updated',
      error: 'Failed to Update'
    })
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
        setFiles((prev) => ({
        ...prev,
        [name]: files?.[0] || null,
        }));
    if(files) {
      form.setValue(name as keyof FormValues, URL.createObjectURL(files[0]));
    }
  }

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetFormWithUserData(form, userData);
    setIsEditing(false);
  }
  

  useEffect(() => {
    if(data) {
      if(data.status === 202) {
        toast.info("Please Fill all Details");
        setIsEditing(true);
      }
      form.reset({
      firstname: userData?.firstname || "",
      username: userData?.username || "",
      lastname: userData?.lastname || "",
      current_salary: userData?.current_salary,
      expected_salary: userData?.expected_salary,
      linkedin_url: userData?.linkedin_url || "",
      github_url: userData?.github_url || "",
      date_of_birth: userData?.date_of_birth ? StringtoDate(userData.date_of_birth): "",
      profile_picture_url: userData?.profile_picture_url || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      resume_url: userData?.resume_url || "",
      address: {
        address: userData?.address?.address || "",
        country: userData?.address?.country || "",
        city: userData?.address?.city || "",
        state: userData?.address?.state || "",
      },
      education: userData?.education?.map(education => {
        return {
          ...education,
          startDate: education.startDate ?  StringtoDate(education.startDate) : "",
          endDate: education.endDate ? StringtoDate(education.endDate) : "",
        }
      }) || [{
        level: "",
        institution: "",
        startDate: "",
        endDate: "",
        percentage: ""
      }],
      work_experience: userData?.work_experience?.map(experience => { // it is for setting a default date in date picket date conversion logic
        return {
          ...experience,
          startDate: experience.startDate ? StringtoDate(experience.startDate) : "",
          endDate: experience.endDate ? StringtoDate(experience.endDate) : ""
        }
      }) || [{
        industryname: "",
        designation: "",
        startDate: "",
        endDate: "",
        description: ""
      }],
      skills: userData?.skills || []
      })
    }
  },[data])

  const countries = useMemo(() => Country.getAllCountries(), []);

  const selectedCountry = form.watch('address.country');
  const selectedState = form.watch('address.state');
  
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
  
   
  if(isLoading) return <ProfileSkeleton />

  return (
    <div className="pt-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} 
         onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">Profile</CardTitle>
                {
                  isEditing 
                  ? 
                  <div className='space-x-2 flex flex-wrap'>
                  <Button variant="destructive" onClick={handleReset} className="flex items-center">
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden md:inline-block ml-1">Reset</span>
                  </Button>
                  <Button type="submit" className="flex items-center">
                    <SaveIcon className="h-4 w-4" />
                    <span className="hidden md:inline-block ml-1">Save</span>
                  </Button>
                  </div> 
                : 
                  <Button onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(true)
                    }}>
                    <Edit2 className="h-4 w-4 mr-1" />
                      Edit Profile
                  </Button>

                }
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className='mx-auto md:mx-0'>
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <div className='space-y-6'>
                    <div className="flex items-center gap-6">
                    <div className="relative group">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={form.watch('profile_picture_url')} />
                        <AvatarFallback>
                          {(form.watch('firstname')?.[0] || '') + (form.watch('lastname')?.[0] || '')}   
                        </AvatarFallback>
                      </Avatar>
                      
                      {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <label htmlFor="avatar-upload" className="cursor-pointer">
                            <Upload className="h-8 w-8 text-white" />
                          </label>
                          <Input
                            id="avatar-upload"
                            name="profile_picture_url"
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </div>
                      )}
                      <FormField
                            control={form.control}
                            name="profile_picture_url"
                            render={() => (
                              <FormItem>
                                <FormMessage />
                              </FormItem>
                            )}
                        />
                    </div>
                      
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name="firstname"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder="First Name" 
                                    {...field} 
                                    disabled={!isEditing}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastname"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder="Last Name" 
                                    {...field} 
                                    disabled={!isEditing}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} disabled/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type='date' {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                        control={form.control}
                        name="address.address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                disabled={!isEditing}
                                onValueChange={(val) => {
                                  if(val) {
                                    field.onChange(val)
                                  }
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
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                disabled={!isEditing}
                                onValueChange={(val) => {
                                  if(val) {
                                    field.onChange(val)
                                  }
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
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                disabled={!isEditing}
                                onValueChange={(val) => {
                                  if(val) {
                                    field.onChange(val)
                                  }
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

                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                        Resume
                        {isEditing && (
                          <>
                            <label htmlFor="resume-upload" className="text-sm text-blue-600 underline cursor-pointer">
                              Change
                            </label>
                            <input
                              id="resume-upload"
                              name='resume_url'
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </>
                        )}
                      </h2>
                      <FormField
                            control={form.control}
                            name="resume_url"
                            render={() => (
                              <FormItem>
                                <FormMessage />
                              </FormItem>
                            )}
                        />

                      <div className="w-full rounded-lg border border-accent bg-background">
                          {form.watch("resume_url") ? (
                              <PDFViewer src={form.watch("resume_url")}/>
                          ) : (
                          <div className="flex items-center justify-center h-32 text-gray-500">No resume available</div>
                          )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="professional" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Work Experience</h3>
                      </div>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendExperience({
                            industryname: "",
                            designation: "",
                            startDate: "",
                            endDate: "",
                            description: ""
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      )}
                    </div>

                    {experienceFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6 relative">
                          <div className="grid gap-4">
                            <div className="flex justify-between">
                              <FormField
                                control={form.control}
                                name={`work_experience.${index}.designation`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel>Designation</FormLabel>
                                    <FormControl>
                                      <Input {...field} disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {isEditing && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  disabled={index === 0}
                                  className="absolute top-2 right-3"
                                  onClick={() => removeExperience(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <FormField
                              control={form.control}
                              name={`work_experience.${index}.industryname`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Industry</FormLabel>
                                  <FormControl>
                                    <Input {...field} disabled={!isEditing} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`work_experience.${index}.startDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`work_experience.${index}.endDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`work_experience.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} disabled={!isEditing} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <h3 className="text-lg font-semibold mr-auto">Skills</h3>
                          {isEditing && (
                         <>
                         <Input
                            ref={skillName} 
                            className='w-[180px]'
                            placeholder='Enter your skill name'
                          />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const Skill = skillName.current?.value || "";
                                if (!Skill.trim()) {
                                  return;
                                }
                                // Check if skill already exists (case insensitive)
                                const existingSkill = watchedSkills.some(
                                  (skill: any) => skill.name.toLowerCase() === Skill.trim().toLowerCase()
                                );

                                if (existingSkill) {
                                  toast.error("Skill already exists!");
                                  return;
                                }
                                
                                appendSkill({
                                name: Skill,
                                rating: 0
                              })
                              if (skillName.current) {
                                skillName.current.value = '';
                              }
                            }
                          }
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Skill
                            </Button>
                            </>
                          )}
                      </div>
                    <div>
                    <FormField
                        control={form.control}
                        name={"skills"}
                        render={() => (
                          <FormItem>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='p-4 gap-2 flex flex-wrap md:flex-nowrap'>
                        {skillFields.map((skill: any, index) => (
                          <StarComponet 
                            key={skill.id}
                            name={skill.name} 
                            rating={watchedSkills && watchedSkills[index] ? watchedSkills[index].rating : 0}
                            isEditing={isEditing}
                            onRatingChange={(rating: string) => {
                            form.setValue(`skills.${index}.rating`, parseInt(rating));
                            }}
                            OnDelete={() => removeSkill(index)}
                          />
                          ))}
                      </div>
                    </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <h3 className="text-lg font-semibold mr-auto">Salary</h3>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="current_salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Salary</FormLabel>
                              <FormControl>
                                <Input type='number' {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="expected_salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Salary</FormLabel>
                              <FormControl>
                                <Input type='number' {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      <h3 className="text-lg font-semibold mr-auto">Social Links</h3>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="linkedin_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Linkedin <span className='text-gray-600'>(optional)</span></FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Paste your LinkedIn URL" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="github_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Github <span className='text-gray-600'>(optional)</span></FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Paste your Github URL" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Education</h3>
                      </div>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendEducation({
                            level: "",
                            institution: "",
                            startDate: "",
                            endDate: "",
                            percentage: ""
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                      )}
                    </div>

                    {educationFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6 relative">
                          <div className="grid gap-4">
                            <div className="flex justify-between">
                              <FormField
                                control={form.control}
                                name={`education.${index}.institution`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel>Institution</FormLabel>
                                    <FormControl>
                                      <Input {...field} disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {isEditing && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  disabled={index === 0}
                                  className="absolute top-2 right-3"
                                  onClick={() => removeEducation(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <FormField
                              control={form.control}
                              name={`education.${index}.level`}
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Education Level</FormLabel>
                                      <Select 
                                          onValueChange={field.onChange} 
                                          defaultValue={field.value}
                                          disabled={!isEditing}
                                      >
                                          <FormControl>
                                              <SelectTrigger>
                                                  <SelectValue placeholder="Select level"  />
                                              </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                              <SelectItem value="high_school">High School</SelectItem>
                                              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                              <SelectItem value="master">Master's Degree</SelectItem>
                                              <SelectItem value="phd">PhD</SelectItem>
                                              <SelectItem value="diploma">Diploma</SelectItem>
                                          </SelectContent>
                                      </Select>
                                      <FormMessage />
                                  </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`education.${index}.startDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`education.${index}.endDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`education.${index}.percentage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Percentage</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} disabled={!isEditing} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default Profile;
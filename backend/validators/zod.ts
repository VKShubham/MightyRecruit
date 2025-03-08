import z from 'zod';


const RegisterFormSchema = z.object({
  firstname: z.string().min(2, "Firstname is Required"),
  lastname: z.string().min(2, "Lastname is Required"),
  username: z.string().min(2, "Username is Required"),
  date_of_birth: z.coerce.string().min(2, "Date of birth is Required"),
  email: z.string().email('Please Enter Valid Email'),
  phone: z.string().length(10, "Please Enter valid Mobile"),
  linkedin_url: z.string()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  github_url: z.string()
    .url("Please enter a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  current_salary: z.string().min(1, "Current Salary is Required"),
  expected_salary: z.string().min(1, "Current Salary is Required"),
  address: z.object({
    address: z.string().min(2, "Address is Required"),
    city: z.string().min(2, "City is Required"),
    country: z.string().min(2, "Country is Required"),
    state: z.string().min(2, "State is Required"),
  }),
  work_experience: z.array(z.object({
    designation: z.string().min(2, "Desgination is Required"),
    industryname: z.string().min(2, "IndustryName is Required"),
    startDate: z.coerce.string().min(2, "Start Date is Required"),
    endDate: z.coerce.string().min(2, "End Date is Required"),
    description: z.string().min(10, "Enter at least 15 characters"),
  })),
  education: z.array(z.object({
    institution: z.string().min(2, "Insutation Name is Required"),
    level: z.string().min(2, "Insutation Level is Required"),
    startDate: z.coerce.string().min(2, "Start Date is Required"),
    endDate: z.coerce.string().min(2, "End Date is Required"),
    percentage: z.coerce.string().min(2, "Insutation Name is Required")
  })),
  skills: z.array(z.object({}).passthrough()).min(2, "Please add Atleast 2 Skills")
}).passthrough();


const jobSchema = z.object({
  title: z.string().min(1, 'Please add title'),
  description: z.string().min(15, 'Please add some job description at least 15 characters'),
  requirements: z.string().min(15, 'Please add some job requirements at least 15 characters'),
  department: z.enum(['R&D', 'Electronics', 'Production', 'HR', 'Sales', 'Account', 'HouseKeeping'], {
    errorMap: () => ({ message: 'Please select a valid department' })
  }),
  work_expierence: z.string().min(1, 'Please Enter valid expierence'),
  status: z.enum(['Open','Closed'], {
    errorMap: () => ({ message: 'Please select valid status'})
  }),
  salary_range: z.string().min(2, 'Salary range is required'),
  shift_type: z.enum(['Full Time','Part Time'], {
    errorMap: () => ({ message: 'Please select valid shift type'})
  }),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  work_mode: z.enum(['On-site','Work From Home','Hybrid'], {
    errorMap: () => ({message: 'Please select valid work mode'})
  }),
  total_vacancy: z.string().min(1, 'Total vacancy is required'),
  total_hired: z.string().min(1, 'Total hired is required'),
  selection_process: z.array(
    z.object({
      stage_name: z.enum(['Technical Interview','HR Interview','CEO Interview','Trial Round'], {
        errorMap: () => ({ message: 'Please select valid stage'})
      }),
    }).passthrough()
  )
});

const application_status = z.enum(['Pending','In Process','Rejected','Hired'], {
  errorMap: () => ({message: 'Pass the Valid Status'})
})

const ChangeApplicationStatusSchema = z.object({
  application_id: z.string().uuid("Please provide valid application id"),
  status: application_status,
  notes: z.string().optional()
})

const interViewSchema = z.object({
  application_id: z.string().uuid('application id is required'),
  interviewer_id: z.string().uuid('interviewer id is required'),
  stage_name: z.string().min(2, 'Stage Name id is required'),
  result: z.enum(['Pass','Fail']),
  candidate_id: z.string().uuid('interviewer id is required'),
  selection_pipeline_id: z.string().uuid('selection_pipeline id is required'),
  feedback: z.string().optional(),
  scheduled_at: z.string().min(2, 'Date Time is Required'),
  meeting_link: z.string().min(2, 'URL is Required'),
  status: z.enum(['Ongoing', 'Rescheduled', 'Scheduled', 'Under Review', 'Cancelled']),
  status_change_reason: z.string().optional(),
})

const EditJobSchema = z.object({
  job_id: z.string().min(2, 'Job ID is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(2, 'State is required'),
  description: z.string().min(15, 'Please add some job description at least 15 characters'),
  requirements: z.string().min(15, 'Please add some job requirements at least 15 characters'),
  salary_range: z.string().min(2, 'Salary range is required'),
  shift_type: z.enum(['Full Time','Part Time'], {
    errorMap: () => ({ message: 'Please select valid shift type'})
  }),
  department: z.enum(['R&D', 'Electronics', 'Production', 'HR', 'Sales', 'Account', 'HouseKeeping'], {
    errorMap: () => ({ message: 'Please select a valid department' })
  }),
  status: z.enum(['Open','Closed'], {
    errorMap: () => ({ message: 'Please select valid status'})
  }),
  work_expierence: z.string().min(1, 'Please Enter valid expierence'),
  title: z.string().min(1, 'Please add title'),
  total_vacancy: z.string().min(1, 'Total vacancy is required'),
  work_mode: z.enum(['On-site','Work From Home','Hybrid'], {
    errorMap: () => ({message: 'Please select valid work mode'})
  }),
})

const signUpSchema = z.object({
  username: z.string().min(3, "Username is Required"),
  email: z.string().email('Invalid Email'),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  })
});

const CreateApplicationSchema = z.object({
  Jobid: z.string().uuid("Please Pass valid Jobid")
})

const setInterviewFeedbackSchema = z.object({
  application_id: z.string().uuid("Provide valid application_id"),
  feedbackData: z.object({
    notes: z.string().min(2, "Please Provide any feedback notes"),
    rating: z.coerce.number()
  }),
  interview_id: z.string().uuid("Provide valid interview_id"),
  selection_pipeline_id: z.string().uuid("Provide valid interview_id"),
})

const updateInterviewAllDetailsSchema = z.object({
  interview_id: z.string().uuid("Please provide valid interview_id"),
  scheduled_at: z.coerce.string().min(2, "Scehdule time is Required"),
  interviewer_id: z.string().uuid("Please provide valid interviewer_id"),
  meeting_link: z.string().min(4, "Meeting link is required"),
  status_change_reason: z.string().optional()
})

const updateInterviewerDetailsSchema = z.object({
  interview_id: z.string().uuid("Please provide valid interview_id"),
  interviewer_id: z.string().uuid("Please provide valid interviewer_id"),
  status_change_reason: z.string().optional()
})

const updateTimeDetailsSchema = z.object({
  interview_id: z.string().uuid("Please provide valid interview_id"),
  scheduled_at: z.coerce.string().min(2, "Scehdule time is Required"),
  status_change_reason: z.string().optional()
})

const updateInterviewerAndTimeDetailsSchema = z.object({
  interview_id: z.string().uuid("Please provide valid interview_id"),
  scheduled_at: z.coerce.string().min(2, "Scehdule time is Required"),
  interviewer_id: z.string().uuid("Please provide valid interviewer_id"),
  status_change_reason: z.string().optional()
})

const CancelInterviewSchema = z.object({
  interview_id: z.string().uuid("Please provide valid interview_id"),
  status_change_reason: z.string().optional()
})

const UpdateResultSchema = z.object({
  interview_id: z.string().uuid("Please provide valid interview_id"),
  result: z.enum(['Pass','Fail'])
})

const addInterviewerSchema = z.object({
  username: z.string().min(2, "Please provide username"),
  email: z.string().email("Please provide valid email")
})

const CreateBageSchema = z.object({
  name: z.string().min(1, "Please provide badge name"),
  color: z.string().min(4, "Please provide badge color")
});

const UpdateBageSchema = z.object({
  id: z.string().uuid("Please provide badge name"),
  name: z.string().min(1, "Please provide badge name"),
  color: z.string().min(4, "Please provide badge color")
});

const createCandidateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(2, 'Password is Required'),
  source: z.string().min(1, 'Source is required')
});

export {
  RegisterFormSchema,
  jobSchema,
  application_status,
  interViewSchema,
  EditJobSchema,
  signUpSchema,
  CreateApplicationSchema,
  ChangeApplicationStatusSchema,
  setInterviewFeedbackSchema,
  updateInterviewAllDetailsSchema,
  updateInterviewerDetailsSchema,
  updateTimeDetailsSchema,
  updateInterviewerAndTimeDetailsSchema,
  CancelInterviewSchema,
  UpdateResultSchema,
  addInterviewerSchema,
  CreateBageSchema,
  createCandidateSchema,
  UpdateBageSchema
}
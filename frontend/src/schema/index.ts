import * as z from "zod";

export const LoginFormSchema = z.object({
    userid: z.string().min(3, {
      message: "Username or email must be at least 3 characters.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
});

export const SignupFormSchema = z.object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    email: z.string().email({
      message: "Enter valid email.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
});

export const RegisterFormSchema = z.object({
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
  current_salary: z.coerce.number().min(2, "Current Salary is Required"),
  expected_salary: z.coerce.number().min(2, "Current Salary is Required"),
  address: z.object({
    address: z.string().min(2, "Address is Required"),
    city: z.string().min(2, "City is Required"),
    country: z.string().min(2, "Country is Required"),
    state: z.string().min(2, "State is Required"),
  }),
  work_experience: z.array(z.object({
    designation: z.string().min(2, "Designation is Required"),
    industryname: z.string().min(2, "Industry Name is Required"),
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
  profile_picture_url: z.string().min(4, "Profile Picture is Required"),
  resume_url: z.string().min(4, "Resume is Required"),
  skills: z.array(z.object({}).passthrough()).min(2, "Please add Atleast 2 Skills")
}).passthrough();


export const jobSchema = z.object({
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
  ).min(1, "Please add Atleast one round")
}).passthrough();

export const EditJobSchema = z.object({
  title: z.string().min(1, 'Please add title'),
  description: z.string().min(15, 'Please add some job description at least 15 characters'),
  requirements: z.string().min(15, 'Please add some job requirements at least 15 characters'),
  salary_range: z.string().min(2, 'Salary range is required'),
  work_mode: z.enum(['On-site','Work From Home','Hybrid'], {
    errorMap: () => ({message: 'Please select valid work mode'})
  }),
  department: z.enum(['R&D', 'Electronics', 'Production', 'HR', 'Sales', 'Account', 'HouseKeeping'], {
    errorMap: () => ({ message: 'Please select a valid department' })
  }),
  shift_type: z.enum(['Full Time','Part Time'], {
    errorMap: () => ({ message: 'Please select valid shift type'})
  }),
  status: z.enum(['Open','Closed'], {
    errorMap: () => ({ message: 'Please select valid job status'})
  }),
  work_expierence: z.string().min(1, 'Please Enter valid expierence'),
  total_vacancy: z.string().min(1, 'Total vacancy is required'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
})

export const createBadgeSchema = z.object({
  name: z.string().min(1, "Badge Name is Required"),
  color: z.string().min(3, "Color is Required")
})
export type CreateBadge = z.infer<typeof createBadgeSchema>;

export const createCredentialSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(2, 'Password is Required'),
    source: z.string().min(1, 'Source is required')
});
export type CreateCrendetail = z.infer<typeof createCredentialSchema>;

export const ChangePasswordSchema = z.object({
    oldpassword: z.string().min(2, 'Old Password is Required'),
    newpassword: z.string().min(2, 'New Password is Required'),
});
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
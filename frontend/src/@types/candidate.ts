type Address = {
    city: string;
    state: string;
    address: string;
    pincode: string;
  };
  
  type Education = {
    endDate: string;
    institution: string;
    level: string;
    percentage: string;
    startDate: string;
  };
  
  type Skill = {
    name: string;
    rating: string;
  };
  
  type WorkExperience = {
    industryname: string;
    role: string;
    designation: string;
    startDate: string;
    endDate: string;
    description: string;
  };
  
  export type Candidate = {
    id: string;
    email: string;
    userid: string;
    firstname: string;
    lastname: string;
    phone: string;
    date_of_birth: string; // Change to Date if needed
    address: Address;
    current_salary: number;
    expected_salary: number;
    education: Education[];
    skills: Skill[];
    work_experience: WorkExperience[];
    github_url: string | null;
    linkedin_url: string | null;
    notes: string | null;
    profile_picture_url: string;
    resume_url: string;
    updated_at: string; // Change to Date if needed
  };
  
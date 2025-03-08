export enum shift_type {
    PartTime = "Part Time",
    FullTime = "Full Time"
}

export enum job_status {
    Active = "Open",
    Closed = "Closed"
}

export enum work_mode {
    Hybrid = "Hybrid",
    Onsite = "On-site",
    WorkFromHome = "Work From Home"
}

export interface Job {
    id: string;
    title: string;
    created_at: string;
    shift_type: shift_type;
    state: string;
    city: string;
    country: string;
    salary_range: string;
    department: string;
    work_experience: string;
    work_mode: work_mode;
    description: string;
    status: job_status;
    requirements: string;
    total_vacancy: string;
    total_hired: number;
}

export type CreateJobForm = {
    title: string;
    description: string;
    requirements: string;
    work_expierence: string;
    status: string;
    salary_range: string;
    department: string;
    shift_type: shift_type | '';
    city: string;
    country: string,
    state: string,
    work_mode: work_mode | '',
    total_vacancy: string,
    total_hired: string,
    selection_process: Array<{
        stage_name: string,
        sequence: string
    }>
}
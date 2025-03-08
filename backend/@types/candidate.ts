import { UUID } from "crypto";
import { User } from "./user";

interface Candidate extends User {
    id?: UUID;
    userid: UUID;
    firstname: string;
    lastname: string;
    phone: string;
    date_of_birth: Date;
    address: object;
    education: object;
    skills: object;
    work_experience: object;
    resume_url: string;
    linkedin_url?: string;
    github_url?: string;
    notes?: string;
    profile_picture_url: string;
    current_salary: number;
    expected_salary: number;
    updated_at: EpochTimeStamp;
}

export {
    Candidate
}
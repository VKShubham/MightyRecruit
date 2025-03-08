import { UUID } from "crypto";

interface User {
    id?: UUID;
    username: string;
    email: string;
    password: string;
    role: user_role;
    created_at?: EpochTimeStamp;
    updated_at: EpochTimeStamp;
    status: user_status
}

enum user_role {
    Interviewer = "Interviewer",
    HR = "HR",
    Candidate = "Candidate"
}

enum user_status {
    Active = "Active",
    Blocked = "Blocked"
}

export {
    User,
    user_role,
    user_status
}
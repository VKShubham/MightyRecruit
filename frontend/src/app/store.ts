import { User } from "@/@types/user";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserState {
    user: User | null;
    addUser: (user: User) => void;
    removeUser: () => void;
}

const useUser = create<UserState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                addUser: (user) => set(() => ({ user })),
                removeUser: () => set(() => ({ user: null })),
            }),
            { name: "user" } 
        )
    )
);


interface JobState {
    jobs: any[];
    addJobs: (jobs: any[]) => void;
}

const useJobs = create<JobState>()(
    devtools(
        persist(
            (set) => ({
                jobs: [],
                addJobs: (jobs) => set(() => ({ jobs })),
            }),
            { name: "jobs" }
        )
    )
);

export { useUser, useJobs };

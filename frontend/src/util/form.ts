import { FormValues } from "@/components/Profile/Profile";
import { StringtoDate } from "./date";

export function resetFormWithUserData(form: any, userData: FormValues) {
    if (!userData) return;
    
    // Format dates properly once in a utility function
    const formattedUserData = {
      ...userData,
      date_of_birth: StringtoDate(userData.date_of_birth),
      education: userData.education?.map(edu => ({
        ...edu,
        startDate: StringtoDate(edu.startDate),
        endDate: StringtoDate(edu.endDate),
      })) || [{
        level: "",
        institution: "",
        startDate: "",
        endDate: "",
        percentage: ""
      }],
      work_experience: userData.work_experience?.map(exp => ({
        ...exp,
        startDate: StringtoDate(exp.startDate),
        endDate: StringtoDate(exp.endDate),
      })) || [{
        industryname: "",
        designation: "",
        startDate: "",
        endDate: "",
        description: ""
      }],
    };
    
    form.reset(formattedUserData);
  }
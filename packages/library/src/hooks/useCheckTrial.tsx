import { AuthContext } from "@/provider/AuthContext";
import { TrialGroupContext } from "@/provider/TrialGroupContext";
import { useContext } from "react"

export const useCheckTrial = () => {
    const { user } = useContext(AuthContext);
    const trialGroup = useContext(TrialGroupContext);
    if (!user) {
        return false;
    }
    if (user.classGroups?.includes(trialGroup || "default-trial-246")) {
        return true;
    }
    
    return false;
}
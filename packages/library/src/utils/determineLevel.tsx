import { t } from "i18next";
import { toast } from "react-toastify";
import type { Level } from "@/types";

export const determineLevel = (grade: Level | string) => {
        switch (grade) {
            case "P1":
            case "P2":
            case "P3":
                return "P1_P3";
            case "P4":
            case "P5":
            case "P6":
                return "P4_P6";
            case "S1":
            case "S2":
            case "S3":
                return "S1_S3";
            case "S4":
            case "S5":
            case "S6":
                return "S4_S6";
            default:
                toast.error(t("Please select a valid grade level."));
                throw new Error("Invalid grade level selected");
        }
    };
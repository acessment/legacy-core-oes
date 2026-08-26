import { UserSettingsCorePage } from "@acessment/core-oes";
import { teacherAuthMiddleware } from "@acessment/core-oes/server";

export const middleware = [teacherAuthMiddleware];

export default function TeacherSettings() {
    return <UserSettingsCorePage showGrade={false} />;
}

import { AuthWrapper, useConfig } from "@acessment/core-oes";

export default function TeacherAuthLayout() {
    const appConfig = useConfig();
    return <AuthWrapper requireTeacher />;
}

import { SingleStudentAccountCorePage, RoleEnum } from "@acessment/core-oes";

export default function TeacherStudentSingle() {
    return <SingleStudentAccountCorePage availableRoles={[RoleEnum.USER, RoleEnum.TEACHER]} />;
}

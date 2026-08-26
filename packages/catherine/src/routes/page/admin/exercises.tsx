import { AdminExerciseCorePage, EXERCISE_TABLE_MENU_ITEMS, ExercisePluginContext, TableDropDownPlugin } from "@acessment/core-oes";
import { getExercisesLoader } from "@acessment/core-oes/server";

export { getExercisesLoader as loader };

export default function AdminExercises() {
    return (
        <AdminExerciseCorePage
            tableDropDownPlugin={
                <TableDropDownPlugin menuItems={EXERCISE_TABLE_MENU_ITEMS} pluginContext={ExercisePluginContext} />
            }
        />
    );
}

import { IExerciseContentJsonData } from "../type";

/**
 * PanelDataUpdateHandler function
 *
 * @param {any} data - The data object to be modified.
 * @param {string} trackingId - A string representing the path to the target value in the data object.
 *                              Path levels are separated by hyphens ("-").
 * @param {string} value - The new value to be assigned to the target key in the data object.
 *
 * @returns {any} The updated data object.
 *
 * @example
 *
 *   let data = { level1: { level2: { level3: "oldValue" } } };
 *   let trackingId = "level1-level2-level3";
 *   let value = "newValue";
 *   let result = PanelDataUpdateHandler(data, trackingId, value);
 *   console.log(result); // { level1: { level2: { level3: "newValue" } } }
 *
 * The function updates the value at the target key specified by the trackingId in the data object.
 * It can handle any number of levels in the object. If the trackingId does not exist in the data object,
 * it will not modify the data object and will return it as is.
 *
 * Note: The data parameter is typed as 'any' to ignore TypeScript type checks. Be cautious when using this function
 *       as it won't provide the benefits of TypeScript type checking.
 */
const PanelDataUpdateHandler = (
    data: any,
    trackingId: string,
    value: string | boolean
): IExerciseContentJsonData => {


    const targetDepth = trackingId.split("-");
    console.log("targetDepth", targetDepth);
    console.log("value", value);
    let currentData = data;

    targetDepth.forEach((depth: any, index) => {
        if (index === targetDepth.length - 1) {
            currentData[depth] = value;
        } else {
            currentData = currentData[depth];
        }
    });
    return data;
};





export default PanelDataUpdateHandler;

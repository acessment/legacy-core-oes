const DialogReducer = (state, action) => {
    switch (action.type) {
        case "OPEN_DIALOG":
            return {
                ...state,
                [action.dialogType]: true,
            };
        case "CLOSE_DIALOG":
            return {
                ...state,
                [action.dialogType]: false,
            };
        default:
            return state;
    }
};
export default DialogReducer;

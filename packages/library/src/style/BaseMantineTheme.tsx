import { createTheme as createMantineTheme } from "@mantine/core";
import { aceBlue } from "./colorsMantine";

export const BASE_THEME_MANTINE = createMantineTheme({
    colors: { aceBlue },
    fontFamily: `Alegreya Sans", "Noto Sans TC", "Noto Sans SC", "sans-serif`,
    components: {
        TextInput: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
        PasswordInput: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
        Select: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
        MultiSelect: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
        NumberInput: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
        Textarea: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
        DateInput: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
        DatePickerInput: {
            styles: {
                input: {
                    "&:focus": {
                        borderColor: "var(--mantine-color-aceBlue-6)",
                        outlineColor: "var(--mantine-color-aceBlue-6)",
                    },
                },
            },
        },
    },
});

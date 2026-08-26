export function getAITextAreaConfig(category: any) {
    switch (category) {
        case "reading":
            return {
                showSpeed: false,
                showWordCount: true,
                showQuestionCount: true,
                showQuestionTypes: true,
                showTenses: false,
                showLevel: true,
                showTemplates: false,
                showInternet: true,
            };
        case "grammar-templates":
            return {
                showSpeed: false,
                showWordCount: false,
                showQuestionCount: true,
                showQuestionTypes: false,
                showTenses: false,
                showLevel: false,
                showTemplates: true,
                showInternet: false,
            };
        case "grammar-mixed-tenses":
            return {
                showSpeed: false,
                showWordCount: false,
                showQuestionCount: false,
                showQuestionTypes: false,
                showTenses: true,
                showLevel: false,
                showTemplates: false,
                showInternet: false,
            };
        case "listening":
            return {
                showSpeed: true,
                showWordCount: true,
                showQuestionCount: false,
                showQuestionTypes: false,
                showTenses: false,
                showLevel: true,
                showTemplates: false,
                showInternet: true,
            };
        case "freestyle":
            return {
                showSpeed: false,
                showWordCount: false,
                showQuestionCount: false,
                showQuestionTypes: false,
                showTenses: false,
                showLevel: false,
                showTemplates: false,
                showInternet: true,
            };
    }
}

export function mapCategoryForDialog(category: string): string {
    switch (category) {
        case "grammar-templates":
            return "grammar";
        case "grammar-mixed-tenses":
            return "grammar";
        case "freestyle":
            return "combined";
        default:
            return category;
    }
}

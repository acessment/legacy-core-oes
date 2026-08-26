export const stylingClassNames = {
    menuButton: (state) =>
        "flex text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm transition-all duration-300 focus:outline-none bg-white hover:border-gray-400 focus:border-blue-500  pl-4 flex items-center",
    searchBox:
        "px-1 py-2 flex bg-gray-200 items-center w-full focus:outline-none rounded-sm",
    searchIcon: "hidden",
    tagItem: (value) =>
        "flex items-center px-2 bg-gray-200 rounded-md text-ace-text-primary-gray",
    tagItemText: "text-sm font-medium text-ace-text-primary-gray",
    tagItemIcon: "w-3 h-3",
    tagItemIconContainer: "",
} as const;

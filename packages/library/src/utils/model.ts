
export type languageType = 'eng' | 'zh_hk' | 'ch';


export type regionType = 'hk' | 'international'

export type optionsType = {
    label: string,
    value: string,
}
export type ITagContainerProps = {
    category: string
    grade: string
    tags: string[]
    isOverflow: boolean | undefined
    allowRemove?: boolean
    onRemove?: (tag: string, type: ITagType) => void

}


export type ITagType = 'category' | 'grade' | 'tag'

export type IdentityType = 'Student' | 'Teacher' | 'Parent' | 'Tutor'

declare global {
    interface Window {
        pdfjsLib: any

    }
}

export type IAlertMsg = {
    type: 'success' | 'error' | 'info' | 'warning',
    message: string
} | null

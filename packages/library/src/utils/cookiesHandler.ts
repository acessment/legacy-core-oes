import Cookies from 'js-cookie'

export const setRedirect = (url: string) => {
    Cookies.set('redirect', url, { expires: 1 })

}

export const getRedirect = () => {
    return Cookies.get('redirect')
}

export const clearRedirect = () => {
    Cookies.remove('redirect')
}
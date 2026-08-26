// Function to get Node environment
const getNodeEnv = () => {
    try {
        return (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV || "development";
    } catch {
        return "development";
    }
};

export const getJwt = () => {
    return localStorage.getItem("JWTTOKEN");
};

export const hasJwt = () => {
    return localStorage.getItem("JWTTOKEN") != null;
};

export const removeJwt = () => {
    localStorage.removeItem("JWTTOKEN");
    const domain = getNodeEnv() === "production" ? ".acessment.ai" : ".localhost";
    document.cookie = `JWTTOKEN=;secure; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
};

export const setJwt = (token: string) => {
    localStorage.setItem("JWTTOKEN", token);

    // Set cookie expiry to 7 days from now (or match your JWT expiry)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    const expires = expiryDate.toUTCString();

    const domain = getNodeEnv() === "production" ? ".acessment.ai" : ".localhost";
    document.cookie = `JWTTOKEN=${token};secure; path=/; domain=${domain}; expires=${expires};`;
};

export const checkExpiredJwt = () => {
    const token = getJwt();
    if (!token) return false;
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // convert to milliseconds
    return Date.now() > exp;
};

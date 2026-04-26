
export const setLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        // SECURITY: Block auth keys from localStorage
        if (key === "api_token" || key === "user_data") {
            console.warn(`[SECURITY] Blocking localStorage write for ${key}. Use cookies instead.`);
            return;
        }
        localStorage.setItem(key, value);
    }
};

export const getLocalStorage = (key: string): string | null => {

    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

export const removeLocalStorage = (key: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

export const clearAllLocalStorage = () => {
    localStorage.clear();
}


import { getCookies } from "./client-cookies";

/**
 * Cek apakah user sudah login dengan memeriksa token dari cookies dan localStorage
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;

    const tokenFromCookies = getCookies('token');
    const tokenFromLocalStorage = localStorage.getItem('token');

    return !!(tokenFromCookies || tokenFromLocalStorage);
};

/**
 * Ambil token dari cookies atau localStorage
 */
export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const tokenFromCookies = getCookies('token');
    const tokenFromLocalStorage = localStorage.getItem('token');

    return tokenFromCookies || tokenFromLocalStorage;
};

/**
 * Ambil data user dari cookies atau localStorage
 */
export const getUserData = () => {
    if (typeof window === 'undefined') return null;

    const fromCookies = {
        id: getCookies('id'),
        name: getCookies('name'),
        role: getCookies('role'),
        profile_picture: getCookies('profile_picture')
    };

    const fromLocalStorage = {
        id: localStorage.getItem('id'),
        name: localStorage.getItem('name'),
        role: localStorage.getItem('role'),
        profile_picture: localStorage.getItem('profile_picture')
    };

    return {
        id: fromCookies.id || fromLocalStorage.id,
        name: fromCookies.name || fromLocalStorage.name,
        role: fromCookies.role || fromLocalStorage.role,
        profile_picture: fromCookies.profile_picture || fromLocalStorage.profile_picture
    };
};

/**
 * Clear semua data autentikasi
 */
export const clearAuthData = () => {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('profile_picture');

    // Note: Cookie akan dihapus oleh removeCookie function
};

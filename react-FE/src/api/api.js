const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const userLang = navigator.language;

let refreshPromise = null;

export class APIError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = "APIError";
        this.status = status;
        this.body = body;
    }
}

export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

export function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

export function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleString(userLang);
}

async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Failed to parse response:", error);
        return text;
    }
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return null;
    }

    let response;

    try {
        response = await fetch(
            `${API_BASE_URL}/api/v1/auth/reissue`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    refreshToken
                })
            }
        );
    } catch (error) {
        throw new APIError(
            error.message || "Server connection failed.",
            0,
            null
        );
    }

    const result = await parseResponse(response);

    if (!response.ok) {
        throw new APIError(
            result?.message || "Failed to reissue tokens.",
            response.status,
            result
        );
    }

    const newAccessToken = result?.data?.accessToken;
    const newRefreshToken = result?.data?.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
        throw new APIError(
            "The token reissue response is invalid.",
            response.status,
            result
        );
    }

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return newAccessToken;
}

async function getRefreshedAccessToken() {
    if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

async function request(path, options = {}) {
    const {
        method = "GET",
        body,
        auth = true,
        headers = {},
        retryOnUnauthorized = true
    } = options;

    const requestHeaders = {
        Accept: "application/json",
        ...headers
    };

    if (auth) {
        const accessToken = getAccessToken();

        if (accessToken) {
            requestHeaders.Authorization = `Bearer ${accessToken}`;
        }
    }

    const fetchOptions = {
        method,
        headers: requestHeaders
    };

    if (body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(body);
    }

    let response;

    try {
        response = await fetch(
            `${API_BASE_URL}${path}`,
            fetchOptions
        );
    } catch (error) {
        throw new APIError(
            error.message || "Server connection failed.",
            0,
            null
        );
    }

    if (response.status === 401 && auth && retryOnUnauthorized) {
        try {
            const newAccessToken = await getRefreshedAccessToken();

            if (newAccessToken) {
                return request(path, {
                    ...options,
                    retryOnUnauthorized: false
                });
            }
        } catch (refreshError) {
            console.error("Token reissue failed:", refreshError);
        }

        clearTokens();
        window.location.replace("/login");

        throw new APIError(
            "Your session has expired. Please log in again.",
            401,
            null
        );
    }

    const result = await parseResponse(response);

    if (!response.ok) {
        throw new APIError(
            result?.message ||
            `Request failed with status ${response.status}`,
            response.status,
            result
        );
    }

    return result;
}

const api = {
    get(path, options = {}) {
        return request(path, {
            ...options,
            method: "GET"
        });
    },

    post(path, body, options = {}) {
        return request(path, {
            ...options,
            method: "POST",
            body
        });
    },

    patch(path, body, options = {}) {
        return request(path, {
            ...options,
            method: "PATCH",
            body
        });
    },

    delete(path, options = {}) {
        return request(path, {
            ...options,
            method: "DELETE"
        });
    }
};

export default api;

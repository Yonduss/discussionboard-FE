const API_BASE_URL = "http://localhost:8080";
const userLang = navigator.language;

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

export function requireLogin() {
    const accessToken = getAccessToken();

    if (!accessToken) {
        alert("Please login first.");
        window.location.href = "/login";
        throw new Error("Access token is missing.");
    }

    return { accessToken };
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
        console.error(error);
        return text;
    }
}

async function request(path, options = {}) {
    const {
        method = "GET",
        body,
        auth = true,
        headers = {}
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
        response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
    } catch (error) {
        throw new APIError(
            error.message || "Server connection failed.",
            0,
            null
        );
    }

    const result = await parseResponse(response);

    if (!response.ok) {
        if (response.status === 401 && auth) {
            localStorage.removeItem("accessToken");
            window.location.replace("/login");
        }

        throw new APIError(
            result?.message || `Request failed with status ${response.status}`,
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
import { useCallback, useEffect, useState } from "react";

import api, { getAccessToken } from "../api/api.js";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
    const hasInitialToken = Boolean(getAccessToken());

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(hasInitialToken);

    const loadCurrentUser = useCallback(async () => {
        try {
            const response = await api.get(
                "/api/v1/users"
            );

            setCurrentUser(response.data);

            return response.data;

        } catch {
            setCurrentUser(null);

            return null;

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!hasInitialToken) {
            return;
        }

        let cancelled = false;

        async function initializeAuth() {
            try {
                const response = await api.get(
                    "/api/v1/users"
                );

                if (!cancelled) {
                    setCurrentUser(response.data);
                }

            } catch {
                if (!cancelled) {
                    setCurrentUser(null);
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void initializeAuth();

        return () => {
            cancelled = true;
        };
    }, [hasInitialToken]);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                loading,
                loadCurrentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
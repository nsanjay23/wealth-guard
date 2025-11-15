import { useState, useEffect } from 'react';

const useAuthStatus = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            setIsLoading(true); // Start loading
            try {
                // Ensure credentials are included if needed for session cookies
                const response = await fetch('http://localhost:5001/api/auth/status', {
                    credentials: 'include' // Important for sending cookies
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUser(data.user); // Store user data
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth status check failed:", err);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false); // Stop loading
            }
        };
        checkStatus();
    }, []); // Empty dependency array means run once on mount

    return { isAuthenticated, user, isLoading };
};

export default useAuthStatus;
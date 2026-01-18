import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
                decodeUser(res.data.access);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
            decodeUser(token);
        }
    };

    const decodeUser = (token) => {
        const decoded = jwtDecode(token);
        // Assuming the token payload contains user info like username/role
        // If not, you might need to fetch user profile separately
        setUser(decoded);
    };

    const login = (access, refresh) => {
        localStorage.setItem(ACCESS_TOKEN, access);
        localStorage.setItem(REFRESH_TOKEN, refresh);
        setIsAuthorized(true);
        decodeUser(access);
    };

    const logout = () => {
        localStorage.clear();
        setIsAuthorized(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthorized, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask not installed!");
            return null;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];

            const userData = { walletAddress, role: "student" };
            setUser(userData);
            localStorage.setItem("walletAddress", walletAddress);

            return walletAddress;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const disconnectWallet = () => {
        setUser(null);
        localStorage.clear();        // Clear everything
        window.location.href = "/login";   // Force redirect to login
    };

    useEffect(() => {
        // NO auto connect on refresh
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, connectWallet, disconnectWallet }}>
            {children}
        </AuthContext.Provider>
    );
};
import { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "./WalletContext";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Case-insensitive admin wallet list including the primary authority address
export const ADMIN_WALLETS = [
  "0x42fb24C49e66e9050D8569135e69fB908e1f7292", // College Authority admin address
  "0x220e790D10f3413a1b2Ead1f124ca2Fa497b8306", // Contract/deployer address
  "0x0000000000000000000000000000000000000000",
];

export const AuthProvider = ({ children }) => {
  const { address, isConnected, isConnecting } = useWallet();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checks Firebase for the profile matching a wallet address
  const checkUserProfile = async (walletAddress) => {
    setLoading(true);
    try {
      const lowerAddress = walletAddress.toLowerCase();
      const docRef = doc(db, "users", lowerAddress);
      
      const isAdmin = ADMIN_WALLETS.some(
        (w) => w.toLowerCase() === lowerAddress
      );

      // Auto-provision College Authority Admin Profile in Firebase
      if (lowerAddress === "0x42fb24c49e66e9050d8569135e69fb908e1f7292".toLowerCase()) {
        const adminProfile = {
          role: "admin",
          walletAddress: "0x42fb24C49e66e9050D8569135e69fB908e1f7292",
          name: "College Authority",
          department: "Administration",
          college: "SVKM IoT Dhule",
          createdAt: new Date().toISOString(),
        };

        // Write or merge profile in Firestore users/0x42fb...
        await setDoc(docRef, adminProfile, { merge: true });

        setUser({
          uid: lowerAddress,
          ...adminProfile,
          profileCompleted: true,
        });
        return;
      }

      // Check standard profile in Firestore
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const role = isAdmin || data.role === "admin" ? "admin" : (data.role || "student");
        setUser({
          uid: lowerAddress,
          walletAddress: walletAddress,
          ...data,
          role: role,
          profileCompleted: true,
        });
      } else {
        // Connected but profile not completed (student default)
        setUser({
          uid: lowerAddress,
          walletAddress: walletAddress,
          role: isAdmin ? "admin" : "student",
          profileCompleted: false,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile from Firebase:", error);
      // Fallback
      setUser({
        uid: walletAddress.toLowerCase(),
        walletAddress: walletAddress,
        role: "student",
        profileCompleted: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Complete profile and save to Firebase
  const completeProfile = async (profileData) => {
    if (!address) throw new Error("No wallet connected");

    setLoading(true);
    try {
      const lowerAddress = address.toLowerCase();
      const userRef = doc(db, "users", lowerAddress);
      
      const isAdmin = ADMIN_WALLETS.some(
        (w) => w.toLowerCase() === lowerAddress
      );
      
      const role = isAdmin ? "admin" : "student";

      const newProfile = {
        name: profileData.name,
        rollNumber: profileData.rollNumber,
        department: profileData.department,
        college: profileData.college,
        email: profileData.email || "",
        studentId: profileData.studentId || "",
        walletAddress: address,
        role: role,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, newProfile);

      setUser({
        uid: lowerAddress,
        ...newProfile,
        profileCompleted: true,
      });

      return true;
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnecting) {
      setLoading(true);
      return;
    }

    if (isConnected && address) {
      checkUserProfile(address);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [address, isConnected, isConnecting]);

  return (
    <AuthContext.Provider value={{ user, loading, completeProfile, checkUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
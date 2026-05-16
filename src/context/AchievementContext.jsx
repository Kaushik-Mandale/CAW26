import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  collection, getDocs, addDoc, query,
  where, onSnapshot, serverTimestamp, doc, updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { DEMO_ACHIEVEMENTS } from "../config/achievements";
import { useWallet } from "./WalletContext";

const AchievementContext = createContext(null);

export function AchievementProvider({ children }) {
  const { address } = useWallet();

  const [availableAchievements, setAvailableAchievements] = useState(DEMO_ACHIEVEMENTS);
  const [myNFTs, setMyNFTs]                               = useState([]);
  const [claimedIds, setClaimedIds]                       = useState(new Set());
  const [isLoading, setIsLoading]                         = useState(false);
  const [stats, setStats]                                 = useState({
    total: 0, certificates: 0, badges: 0, rewards: 0,
  });

  // Load available achievements from Firestore (fallback to demo data)
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const snap = await getDocs(collection(db, "achievements"));
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setAvailableAchievements(data);
        }
        // else: keep DEMO_ACHIEVEMENTS as fallback
      } catch {
        // Firebase not configured yet — use demo data
      }
    };
    fetchAchievements();
  }, []);

  // Real-time listener for student's NFTs
  useEffect(() => {
    if (!address) {
      setMyNFTs([]);
      setClaimedIds(new Set());
      return;
    }
    setIsLoading(true);
    let unsub = () => {};
    try {
      const q = query(
        collection(db, "studentNFTs"),
        where("studentAddress", "==", address.toLowerCase())
      );
      unsub = onSnapshot(q, (snap) => {
        const nfts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMyNFTs(nfts);
        setClaimedIds(new Set(nfts.map(n => n.achievementId)));
        setStats({
          total:        nfts.length,
          certificates: nfts.filter(n => n.type === "certificate").length,
          badges:       nfts.filter(n => n.type === "badge").length,
          rewards:      nfts.filter(n => n.type === "reward").length,
        });
        setIsLoading(false);
      });
    } catch {
      setIsLoading(false);
    }
    return () => unsub();
  }, [address]);

  // Save a minted NFT record to Firestore
  const saveMintedNFT = useCallback(async ({
    achievementId, title, type, issuerName, eventName,
    txHash, tokenId, tokenURI,
  }) => {
    if (!address) return;
    try {
      await addDoc(collection(db, "studentNFTs"), {
        studentAddress: address.toLowerCase(),
        achievementId, title, type, issuerName, eventName,
        txHash, tokenId, tokenURI,
        mintedAt: serverTimestamp(),
        network: "Base Sepolia",
        chainId: 84532,
        verified: true,
      });
    } catch (err) {
      console.warn("Firestore save failed:", err);
      // Still update local state so UI works offline
      setMyNFTs(prev => [...prev, {
        achievementId, title, type, issuerName, eventName,
        txHash, tokenId, studentAddress: address.toLowerCase(),
        mintedAt: new Date().toISOString(),
      }]);
      setClaimedIds(prev => new Set([...prev, achievementId]));
    }
  }, [address]);

  // Admin: create a new achievement
  const createAchievement = useCallback(async (data) => {
    try {
      const ref = await addDoc(collection(db, "achievements"), {
        ...data, createdAt: serverTimestamp(),
      });
      setAvailableAchievements(prev => [...prev, { id: ref.id, ...data }]);
      return ref.id;
    } catch (err) {
      throw new Error("Failed to create achievement: " + err.message);
    }
  }, []);

  const isClaimed = useCallback((achievementId) => claimedIds.has(achievementId), [claimedIds]);

  const value = {
    availableAchievements, myNFTs, stats,
    isLoading, isClaimed, saveMintedNFT, createAchievement,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievement() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error("useAchievement must be used within AchievementProvider");
  return ctx;
}

export default AchievementContext;

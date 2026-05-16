import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CHAIN_ID, NETWORK_NAME, EXPLORER_URL } from "../config/contract";

const WalletContext = createContext(null);

const BASE_SEPOLIA = {
  chainId: `0x${CHAIN_ID.toString(16)}`,  // 0x14a74 = 84532
  chainName: "Base Sepolia Testnet",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: [EXPLORER_URL],
};

export function WalletProvider({ children }) {
  const [address, setAddress]       = useState(null);
  const [signer, setSigner]         = useState(null);
  const [provider, setProvider]     = useState(null);
  const [chainId, setChainId]       = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]           = useState(null);
  const [balance, setBalance]       = useState("0");

  const isCorrectChain = chainId === CHAIN_ID;

  const updateBalance = useCallback(async (prov, addr) => {
    try {
      const bal = await prov.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    } catch { /* silent */ }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install MetaMask to continue.");
      return false;
    }
    setIsConnecting(true);
    setError(null);
    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const prov     = new ethers.BrowserProvider(window.ethereum);
      const sign     = await prov.getSigner();
      const network  = await prov.getNetwork();
      const addr     = accounts[0];

      setProvider(prov);
      setSigner(sign);
      setAddress(addr);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      await updateBalance(prov, addr);

      return true;
    } catch (err) {
      setError(err.message || "Failed to connect wallet.");
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  const switchToBaseSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA.chainId }],
      });
    } catch (switchError) {
      // Chain not added — add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BASE_SEPOLIA],
        });
      }
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setIsConnected(false);
    setBalance("0");
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) await connectWallet();
      } catch { /* silent */ }
    };
    autoConnect();
  }, [connectWallet]);

  // Listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnectWallet();
      else setAddress(accounts[0]);
    };
    const handleChainChanged = (chain) => {
      setChainId(Number(chain));
      window.location.reload();
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnectWallet]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const value = {
    address, signer, provider, chainId, isConnected,
    isConnecting, error, balance, shortAddress, isCorrectChain,
    connectWallet, disconnectWallet, switchToBaseSepolia,
    CHAIN_ID, NETWORK_NAME,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export default WalletContext;

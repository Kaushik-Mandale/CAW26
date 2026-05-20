import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { useUGFModal } from "@tychilabs/react-ugf";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_ID } from "../config/contract";
import { useWallet } from "../context/WalletContext";
import { useAchievement } from "../context/AchievementContext";
import toast from "react-hot-toast";

export function useMintNFT() {
  const { signer, address, isConnected } = useWallet();
  const { saveMintedNFT } = useAchievement();
  const { openUGF, result: ugfResult } = useUGFModal();

  const [activeAchievement, setActiveAchievement] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [mintError, setMintError] = useState(null);

  const [processedTxHash, setProcessedTxHash] = useState(null);
  const [expectedTxStarted, setExpectedTxStarted] = useState(false);

  const buildTokenURI = useCallback((achievement, studentAddr) => {
    const svgCard = generateCertificateSVG(achievement, studentAddr);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgCard)));

    const metadata = {
      name: achievement.title,
      description: achievement.description || achievement.title,
      image: `data:image/svg+xml;base64,${svgBase64}`,
      attributes: [
        { trait_type: "Type", value: achievement.type },
        { trait_type: "Issuer", value: achievement.issuerName },
        { trait_type: "Event", value: achievement.eventName },
        { trait_type: "Rarity", value: achievement.rarity || "Common" },
        { trait_type: "Points", value: achievement.points || 0 },
        { trait_type: "Network", value: "Base Sepolia" },
        { trait_type: "Gas Method", value: "UGF Gasless" },
        { trait_type: "Issued Date", value: new Date().toISOString() },
      ],
    };

    const metaStr = JSON.stringify(metadata);
    const metaB64 = btoa(unescape(encodeURIComponent(metaStr)));
    return `data:application/json;base64,${metaB64}`;
  }, []);

  const mintNFT = useCallback(async (achievement) => {
    if (!isConnected || !signer) {
      setMintError("Please connect your wallet first.");
      return null;
    }

    setMintError(null);
    setMintResult(null);

    try {
      if (
        !achievement.studentWalletAddress ||
        achievement.studentWalletAddress.toLowerCase() !== address.toLowerCase()
      ) {
        throw new Error("Unauthorized: This certificate is not assigned to your connected wallet address.");
      }

      if (achievement.claimed) {
        throw new Error("This certificate has already been claimed as an NFT proof.");
      }

      const iface = new ethers.Interface(CONTRACT_ABI);
      const calldata = iface.encodeFunctionData("mintAchievement", [
        address,
        buildTokenURI(achievement, address),
        achievement.title,
        achievement.type,
        achievement.issuerName,
        achievement.eventName,
      ]);

      setActiveAchievement(achievement);
      setIsMinting(true);
      setExpectedTxStarted(true);

      await openUGF({
        signer,
        tx: {
          to: CONTRACT_ADDRESS,
          data: calldata,
          value: 0n,
        },
        destChainId: String(CHAIN_ID),
      });
    } catch (err) {
      const msg = err?.message || "Failed to open transaction modal. Please try again.";
      setMintError(msg);
      setIsMinting(false);
      setActiveAchievement(null);
      setExpectedTxStarted(false);
      console.error("Mint initiation error:", err);
    }
  }, [isConnected, signer, address, openUGF, buildTokenURI]);

  useEffect(() => {
    if (
      !expectedTxStarted ||
      !ugfResult ||
      !ugfResult.txHash ||
      !activeAchievement ||
      !signer
    ) {
      return;
    }

    if (ugfResult.txHash === processedTxHash) {
      return;
    }

    let isSubscribed = true;

    const finalizeClaim = async () => {
      const txHash = ugfResult.txHash;

      setProcessedTxHash(txHash);
      setIsMinting(true);

      toast.loading("Verifying blockchain transaction...", {
        id: "ugf-mint-confirm",
      });

      try {
        let receipt = null;

        if (signer.provider) {
          receipt = await signer.provider.waitForTransaction(txHash);

          if (!receipt || receipt.status === 0) {
            throw new Error("On-chain transaction failed or was reverted.");
          }
        }

        let tokenId = Date.now().toString();

        try {
          const iface = new ethers.Interface(CONTRACT_ABI);

          for (const log of receipt?.logs || []) {
            try {
              const parsed = iface.parseLog(log);

              if (
                parsed?.name === "AchievementMinted" &&
                parsed?.args?.tokenId
              ) {
                tokenId = parsed.args.tokenId.toString();
                break;
              }

              if (
                parsed?.name === "Transfer" &&
                parsed?.args?.tokenId
              ) {
                tokenId = parsed.args.tokenId.toString();
                break;
              }
            } catch {
              // Ignore unrelated logs
            }
          }
        } catch {
          // Keep fallback tokenId
        }

        const tokenURI = buildTokenURI(activeAchievement, address);

        const mintData = {
          achievementId: activeAchievement.id,
          title: activeAchievement.title,
          type: activeAchievement.type,
          issuerName: activeAchievement.issuerName,
          eventName: activeAchievement.eventName,
          txHash,
          tokenId,
          tokenURI,
        };

        if (isSubscribed) {
          await saveMintedNFT(mintData);
          setMintResult({ ...mintData, achievement: activeAchievement });
          toast.success("NFT Claimed Successfully!", {
            id: "ugf-mint-confirm",
          });
        }
      } catch (err) {
        console.error("On-chain verification error:", err);

        if (isSubscribed) {
          setMintError(err?.message || "Blockchain transaction failed.");
          toast.error(err?.message || "Transaction failed.", {
            id: "ugf-mint-confirm",
          });
        }
      } finally {
        if (isSubscribed) {
          setIsMinting(false);
          setActiveAchievement(null);
          setExpectedTxStarted(false);
        }
      }
    };

    finalizeClaim();

    return () => {
      isSubscribed = false;
    };
  }, [
    expectedTxStarted,
    ugfResult,
    activeAchievement,
    processedTxHash,
    signer,
    address,
    buildTokenURI,
    saveMintedNFT,
  ]);

  const resetMint = useCallback(() => {
    setMintResult(null);
    setMintError(null);
    setIsMinting(false);
    setActiveAchievement(null);
    setExpectedTxStarted(false);
  }, []);

  return { mintNFT, isMinting, mintResult, mintError, resetMint };
}

function generateCertificateSVG(achievement, studentAddr) {
  const typeColors = {
    certificate: { bg: "#1e1b4b", accent: "#818cf8", border: "#6366f1" },
    badge: { bg: "#1c1a0e", accent: "#fbbf24", border: "#f59e0b" },
    reward: { bg: "#0d1f2d", accent: "#34d399", border: "#10b981" },
  };

  const colors = typeColors[achievement.type] || typeColors.certificate;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shortAddr = studentAddr
    ? `${studentAddr.slice(0, 8)}...${studentAddr.slice(-6)}`
    : "0x...";

  const safeDescription = achievement.description || achievement.title || "";
  const safeTitle = achievement.title || "Achievement";
  const safeType = achievement.type || "certificate";
  const safeEvent = achievement.eventName || safeTitle;
  const safeIssuer = achievement.issuerName || "SVKM IoT Dhule";
  const safeImage = achievement.image || "🎓";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#0a0a1a;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${colors.border};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1"/>
    </linearGradient>
  </defs>

  <rect width="500" height="300" fill="url(#bg)" rx="16"/>
  <rect x="2" y="2" width="496" height="296" fill="none" stroke="url(#accent)" stroke-width="2" rx="15" opacity="0.8"/>
  <rect x="20" y="20" width="460" height="4" fill="url(#accent)" rx="2"/>

  <text x="40" y="90" font-size="48" font-family="Segoe UI Emoji,Apple Color Emoji,sans-serif">${safeImage}</text>
  <text x="110" y="75" font-size="18" font-weight="700" fill="${colors.accent}" font-family="Arial,sans-serif">${safeTitle.slice(0, 32)}</text>
  <text x="110" y="98" font-size="11" fill="#9ca3af" font-family="Arial,sans-serif">${safeType.toUpperCase()} · ${safeEvent.slice(0, 32)}</text>

  <line x1="40" y1="120" x2="460" y2="120" stroke="${colors.accent}" stroke-width="0.5" opacity="0.4"/>

  <text x="40" y="145" font-size="10" fill="#d1d5db" font-family="Arial,sans-serif">
    <tspan x="40" dy="0">${safeDescription.slice(0, 65)}</tspan>
    <tspan x="40" dy="15">${safeDescription.slice(65, 120)}</tspan>
  </text>

  <text x="40" y="195" font-size="9" fill="#6b7280" font-family="monospace">ISSUER</text>
  <text x="40" y="210" font-size="11" fill="#e5e7eb" font-family="Arial,sans-serif">${safeIssuer.slice(0, 24)}</text>

  <text x="200" y="195" font-size="9" fill="#6b7280" font-family="monospace">DATE</text>
  <text x="200" y="210" font-size="11" fill="#e5e7eb" font-family="Arial,sans-serif">${date}</text>

  <text x="360" y="195" font-size="9" fill="#6b7280" font-family="monospace">NETWORK</text>
  <text x="360" y="210" font-size="11" fill="${colors.accent}" font-family="Arial,sans-serif">Base Sepolia</text>

  <line x1="40" y1="225" x2="460" y2="225" stroke="${colors.accent}" stroke-width="0.5" opacity="0.3"/>

  <text x="40" y="248" font-size="9" fill="#6b7280" font-family="monospace">WALLET</text>
  <text x="40" y="262" font-size="10" fill="#9ca3af" font-family="monospace">${shortAddr}</text>

  <text x="360" y="255" font-size="9" fill="${colors.accent}" font-family="Arial,sans-serif" text-anchor="middle">Powered by UGF</text>
  <text x="360" y="270" font-size="8" fill="#6b7280" font-family="Arial,sans-serif" text-anchor="middle">No ETH Required · Gasless</text>

  <text x="250" y="290" font-size="8" fill="#4b5563" font-family="Arial,sans-serif" text-anchor="middle">Campus Achievement Wallet · HackWithMumbai 3.0</text>
</svg>`;
}

export default useMintNFT;
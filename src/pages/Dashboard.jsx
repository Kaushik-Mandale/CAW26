import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useAchievement } from "../context/AchievementContext";
import StatsGrid from "../components/StatsGrid";
import NFTCard from "../components/NFTCard";
import AchievementTimeline from "../components/AchievementTimeline";
import { UGFBanner } from "../components/UGFBadge";

const TABS = ["My NFTs", "Timeline", "Wallet"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { address, shortAddress, balance, isConnected, isCorrectChain, switchToBaseSepolia, connectWallet, NETWORK_NAME } = useWallet();
  const { myNFTs, isLoading } = useAchievement();
  const [activeTab, setActiveTab] = useState("My NFTs");

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
        <motion.div
          className="glass-card p-10 max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🦊</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-slate-400 mb-6 text-sm">Connect MetaMask to view your achievement dashboard</p>
          <motion.button
            id="dashboard-connect-btn"
            onClick={connectWallet}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full py-3.5"
          >
            🦊 Connect MetaMask
          </motion.button>
          <p className="text-xs text-slate-500 mt-4">No ETH required · Powered by UGF</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 bg-mesh pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              My <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {shortAddress} · {NETWORK_NAME}
              {!isCorrectChain && (
                <button onClick={switchToBaseSepolia} className="ml-2 text-amber-400 hover:text-amber-300 underline">
                  ⚠️ Switch network
                </button>
              )}
            </p>
          </div>
          <motion.button
            id="dashboard-claim-btn"
            onClick={() => navigate("/achievements")}
            whileHover={{ scale: 1.03 }}
            className="btn-primary py-2.5 px-5 text-sm"
          >
            ⚡ Claim New NFT
          </motion.button>
        </motion.div>

        {/* UGF Banner */}
        <div className="mb-6">
          <UGFBanner />
        </div>

        {/* Stats */}
        <div className="mb-8">
          <StatsGrid />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-xl mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase().replace(" ", "-")}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-glow-brand"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* MY NFTs */}
          {activeTab === "My NFTs" && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="shimmer rounded-2xl h-80" />
                  ))}
                </div>
              ) : myNFTs.length === 0 ? (
                <motion.div
                  className="glass-card p-16 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-white mb-2">No NFTs Yet</h3>
                  <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                    Start building your blockchain achievement portfolio by claiming your first NFT.
                  </p>
                  <motion.button
                    onClick={() => navigate("/achievements")}
                    whileHover={{ scale: 1.03 }}
                    className="btn-primary py-2.5 px-6"
                  >
                    ⚡ Claim First Achievement
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myNFTs.map((nft, i) => (
                    <motion.div
                      key={nft.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <NFTCard
                        achievement={{
                          id:          nft.achievementId,
                          title:       nft.title,
                          type:        nft.type,
                          issuerName:  nft.issuerName,
                          eventName:   nft.eventName,
                          description: nft.title,
                          image:       { certificate: "🎓", badge: "🏅", reward: "🏆" }[nft.type] || "⭐",
                          color:       "#6366f1",
                          gradient:    "from-indigo-500 to-purple-600",
                          rarity:      "Rare",
                          points:      100,
                        }}
                        minted
                        txHash={nft.txHash}
                        tokenId={nft.tokenId}
                        mintedAt={nft.mintedAt}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TIMELINE */}
          {activeTab === "Timeline" && (
            <div className="max-w-2xl">
              <AchievementTimeline />
            </div>
          )}

          {/* WALLET STATUS */}
          {activeTab === "Wallet" && (
            <div className="max-w-lg space-y-4">
              {/* Wallet card */}
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span>🦊</span> Wallet Status
                </h3>
                <div className="space-y-3 text-sm">
                  <Row label="Address" value={address} mono truncate />
                  <Row label="Network"  value={NETWORK_NAME} />
                  <Row label="ETH Balance" value={`${parseFloat(balance).toFixed(4)} ETH`} />
                  <Row label="Chain ID" value="84532" mono />
                  <Row
                    label="Status"
                    value={<span className="badge-success">✅ Connected</span>}
                  />
                </div>
              </div>

              {/* UGF card */}
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span>⚡</span> UGF Gas Status
                </h3>
                <div className="space-y-3 text-sm">
                  <Row label="Gas Token"    value="TYI_MOCK_USD" />
                  <Row label="ETH Required" value="❌ None" />
                  <Row label="Gas Sponsor"  value="UGF Protocol" />
                  <Row label="Chain"        value="Base Sepolia" />
                </div>
                <a
                  href="https://universalgasframework.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2 px-4 mt-4 inline-block"
                >
                  Get TYI_MOCK_USD →
                </a>
              </div>

              {/* Blockchain card */}
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span>🔗</span> Blockchain Info
                </h3>
                <div className="space-y-3 text-sm">
                  <Row label="Network"    value="Base Sepolia Testnet" />
                  <Row label="Explorer"   value={
                    <a href="https://sepolia.basescan.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                      sepolia.basescan.org
                    </a>
                  } />
                  <Row label="Standard"   value="ERC-721 NFT" />
                  <Row label="Framework"  value="OpenZeppelin" />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, truncate }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`text-slate-200 ${mono ? "font-mono text-xs" : ""} ${truncate ? "truncate max-w-[180px]" : "text-right"}`}>
        {value}
      </span>
    </div>
  );
}

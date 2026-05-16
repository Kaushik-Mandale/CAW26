import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievement } from "../context/AchievementContext";
import ClaimModal from "../components/ClaimModal";
import { UGFBanner } from "../components/UGFBadge";
import { ACHIEVEMENT_TYPES, RARITY_COLORS } from "../config/achievements";

const FILTERS = ["All", "Certificate", "Badge", "Reward"];

export default function Achievements() {
  const { availableAchievements, isClaimed } = useAchievement();
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null); // achievement to claim

  const filtered = availableAchievements.filter(a => {
    const matchType   = filter === "All" || a.type === filter.toLowerCase();
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.issuerName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-dark-950 bg-mesh pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Available <span className="gradient-text">Achievements</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Browse and claim NFT certificates, badges, and rewards — gasless via UGF.
          </p>
        </motion.div>

        {/* UGF Banner */}
        <div className="mb-6">
          <UGFBanner />
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Filter tabs */}
          <div className="flex gap-1 p-1 glass rounded-xl">
            {FILTERS.map(f => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              id="achievement-search"
              type="text"
              placeholder="Search achievements…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/10 focus:border-indigo-500/50 outline-none"
            />
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-slate-500 mb-4">
          Showing {filtered.length} achievement{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((ach, i) => (
              <AchievementListCard
                key={ach.id}
                achievement={ach}
                claimed={isClaimed(ach.id)}
                index={i}
                onClaim={() => setSelected(ach)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div
            className="glass-card p-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-300 font-medium">No achievements found</p>
            <p className="text-sm text-slate-500 mt-1">Try a different filter or search term</p>
          </motion.div>
        )}
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {selected && (
          <ClaimModal
            achievement={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AchievementListCard({ achievement, claimed, index, onClaim }) {
  const typeInfo   = ACHIEVEMENT_TYPES[achievement.type] || ACHIEVEMENT_TYPES.badge;
  const rarityColor = RARITY_COLORS[achievement.rarity] || "#9ca3af";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card overflow-hidden group"
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${achievement.gradient}`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: `${achievement.color}18`, border: `1px solid ${achievement.color}35` }}
          >
            {achievement.image}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${rarityColor}18`, border: `1px solid ${rarityColor}30`, color: rarityColor }}
            >
              {achievement.rarity}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ color: typeInfo.color, background: `${typeInfo.color}15` }}
            >
              {typeInfo.icon} {typeInfo.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-base mb-1 leading-snug">
          {achievement.title}
        </h3>
        <p className="text-xs text-slate-400 mb-1">{achievement.issuerName}</p>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{achievement.description}</p>

        {/* Points + Action */}
        <div className="flex items-center justify-between">
          <span className="badge-gold text-xs">⭐ {achievement.points} pts</span>

          {claimed ? (
            <span className="badge-success">✅ Claimed</span>
          ) : (
            <motion.button
              id={`claim-btn-${achievement.id}`}
              onClick={onClaim}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-xs py-2 px-4"
            >
              ⚡ Claim NFT
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

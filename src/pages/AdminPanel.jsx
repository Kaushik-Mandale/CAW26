import { useState } from "react";
import { motion } from "framer-motion";
import { useAchievement } from "../context/AchievementContext";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";

const ACHIEVEMENT_TEMPLATES = [
  { title: "HackWithMumbai 3.0 Participant", type: "badge",       issuerName: "HackWithMumbai",  eventName: "HackWithMumbai 3.0",    description: "Participation badge for HackWithMumbai 3.0 hackathon.", image: "🏆", color: "#f59e0b", gradient: "from-yellow-500 to-orange-500", rarity: "Common",    points: 50  },
  { title: "Web3 Builder Certificate",       type: "certificate", issuerName: "HackWithMumbai",  eventName: "HackWithMumbai 3.0",    description: "Certificate for building a Web3 dApp on Base Sepolia.", image: "🎓", color: "#6366f1", gradient: "from-indigo-500 to-purple-600", rarity: "Rare",      points: 150 },
  { title: "Smart Contract Developer",       type: "badge",       issuerName: "Base Ecosystem",  eventName: "Base Buildathon",       description: "Badge for deploying ERC-721 contracts on Base Sepolia.", image: "📜", color: "#10b981", gradient: "from-emerald-500 to-teal-500",   rarity: "Rare",      points: 200 },
  { title: "Blockchain Innovator Award",     type: "reward",      issuerName: "Mumbai University",eventName: "Blockchain Workshop",   description: "Award for innovative blockchain project implementation.", image: "⛓️", color: "#a855f7", gradient: "from-purple-500 to-pink-500",   rarity: "Epic",      points: 300 },
  { title: "DeFi Pioneer",                   type: "reward",      issuerName: "TychiLabs",       eventName: "UGF Demo Day",          description: "Pioneered gasless DeFi using Universal Gas Framework.", image: "🚀", color: "#3b82f6", gradient: "from-blue-500 to-cyan-500",     rarity: "Legendary", points: 500 },
];

export default function AdminPanel() {
  const { isConnected } = useWallet();
  const { createAchievement, availableAchievements } = useAchievement();

  const [form, setForm] = useState({
    title: "", type: "badge", issuerName: "",
    eventName: "", description: "", image: "🏆",
    color: "#6366f1", gradient: "from-indigo-500 to-purple-600",
    rarity: "Common", points: 50,
  });
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("Create");

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const loadTemplate = (tpl) => setForm({ ...tpl });

  const handleCreate = async () => {
    if (!form.title || !form.issuerName || !form.eventName) {
      toast.error("Fill in Title, Issuer, and Event fields.");
      return;
    }
    setCreating(true);
    try {
      await createAchievement(form);
      toast.success(`✅ Achievement "${form.title}" created!`);
      setForm({ title: "", type: "badge", issuerName: "", eventName: "", description: "", image: "🏆", color: "#6366f1", gradient: "from-indigo-500 to-purple-600", rarity: "Common", points: 50 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
        <div className="glass-card p-10 max-w-md text-center">
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="text-xl font-bold text-white mb-2">Admin Panel</h2>
          <p className="text-slate-400 text-sm">Connect your wallet to access the admin panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 bg-mesh pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Admin <span className="gradient-text">Panel</span>
          </h1>
          <p className="text-slate-400 text-sm">Create achievements and issue NFT certificates to students.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-xl mb-8 w-fit">
          {["Create", "Templates", "Manage"].map(t => (
            <button
              key={t}
              id={`admin-tab-${t.toLowerCase()}`}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CREATE tab */}
        {activeTab === "Create" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div className="glass-card p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-bold text-white mb-5">Create New Achievement</h2>
              <div className="space-y-4">
                <Field label="Title *">
                  <input id="admin-title" type="text" value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="e.g. Web3 Builder Certificate" className="input-field" />
                </Field>
                <Field label="Type">
                  <select id="admin-type" value={form.type} onChange={e => handleChange("type", e.target.value)} className="input-field">
                    <option value="certificate">🎓 Certificate</option>
                    <option value="badge">🏅 Badge</option>
                    <option value="reward">🏆 Reward</option>
                  </select>
                </Field>
                <Field label="Issuer Name *">
                  <input id="admin-issuer" type="text" value={form.issuerName} onChange={e => handleChange("issuerName", e.target.value)} placeholder="e.g. Mumbai University" className="input-field" />
                </Field>
                <Field label="Event Name *">
                  <input id="admin-event" type="text" value={form.eventName} onChange={e => handleChange("eventName", e.target.value)} placeholder="e.g. HackWithMumbai 3.0" className="input-field" />
                </Field>
                <Field label="Description">
                  <textarea id="admin-desc" value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} placeholder="Describe this achievement…" className="input-field resize-none" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Icon (Emoji)">
                    <input id="admin-icon" type="text" value={form.image} onChange={e => handleChange("image", e.target.value)} className="input-field text-2xl" />
                  </Field>
                  <Field label="Rarity">
                    <select id="admin-rarity" value={form.rarity} onChange={e => handleChange("rarity", e.target.value)} className="input-field">
                      {["Common", "Rare", "Epic", "Legendary"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Points">
                  <input id="admin-points" type="number" value={form.points} onChange={e => handleChange("points", Number(e.target.value))} className="input-field" min={0} />
                </Field>

                <motion.button
                  id="admin-create-btn"
                  onClick={handleCreate}
                  disabled={creating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3 mt-2"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : "✅ Create Achievement"}
                </motion.button>
              </div>
            </motion.div>

            {/* Preview */}
            <motion.div className="glass-card p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-bold text-white mb-5">Preview</h2>
              <div className="glass rounded-2xl overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${form.gradient}`} />
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: `${form.color}18` }}>
                      {form.image}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{form.title || "Achievement Title"}</p>
                      <p className="text-xs text-slate-400 mt-1">{form.issuerName || "Issuer"} · {form.eventName || "Event"}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">{form.type} · {form.rarity}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{form.description || "Achievement description will appear here."}</p>
                  <div className="flex justify-between items-center">
                    <span className="badge-gold">⭐ {form.points} pts</span>
                    <span className="badge-ugf">⚡ UGF · Base Sepolia</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* TEMPLATES tab */}
        {activeTab === "Templates" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ACHIEVEMENT_TEMPLATES.map((tpl, i) => (
              <motion.div
                key={tpl.title}
                className="glass-card overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className={`h-1.5 bg-gradient-to-r ${tpl.gradient}`} />
                <div className="p-5">
                  <div className="text-3xl mb-3">{tpl.image}</div>
                  <p className="font-bold text-white text-sm mb-1">{tpl.title}</p>
                  <p className="text-xs text-slate-400 mb-3">{tpl.type} · {tpl.rarity}</p>
                  <button
                    id={`template-load-${i}`}
                    onClick={() => { loadTemplate(tpl); setActiveTab("Create"); }}
                    className="btn-secondary text-xs py-1.5 px-3 w-full"
                  >
                    Use Template →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MANAGE tab */}
        {activeTab === "Manage" && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm mb-4">
              {availableAchievements.length} achievement{availableAchievements.length !== 1 ? "s" : ""} available
            </p>
            {availableAchievements.map((a, i) => (
              <motion.div
                key={a.id || i}
                className="glass-card p-4 flex items-center justify-between gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.image}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{a.title}</p>
                    <p className="text-xs text-slate-400">{a.issuerName} · {a.type}</p>
                  </div>
                </div>
                <span className="badge-ugf shrink-0">⭐ {a.points} pts</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`.input-field { width:100%; padding:0.625rem 0.875rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:0.75rem; color:#f1f5f9; font-size:0.875rem; outline:none; } .input-field:focus { border-color:rgba(99,102,241,0.5); }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import { UGFBadge } from "./UGFBadge";

const NAV_LINKS = [
  { to: "/",             label: "Home",          icon: "🏠" },
  { to: "/dashboard",   label: "Dashboard",     icon: "📊" },
  { to: "/achievements",label: "Achievements",  icon: "🏆" },
  { to: "/verify",      label: "Verify",        icon: "🔍" },
  { to: "/admin",       label: "Admin",         icon: "⚙️" },
];

export default function Navbar() {
  const { address, shortAddress, isConnected, isConnecting, connectWallet, disconnectWallet, isCorrectChain, switchToBaseSepolia } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    const ok = await connectWallet();
    if (ok) navigate("/dashboard");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-glow-brand group-hover:shadow-glow-purple transition-all">
            🎓
          </div>
          <div className="hidden sm:block">
            <p className="font-display font-bold text-sm gradient-text leading-none">Campus</p>
            <p className="font-display font-bold text-sm text-slate-300 leading-none">Achievement Wallet</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side: UGF badge + wallet */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <UGFBadge />
          </div>

          {/* Chain warning */}
          {isConnected && !isCorrectChain && (
            <motion.button
              onClick={switchToBaseSepolia}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              ⚠️ Switch to Base Sepolia
            </motion.button>
          )}

          {/* Wallet button */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-300">{shortAddress}</span>
              </div>
              <motion.button
                onClick={disconnectWallet}
                whileHover={{ scale: 1.02 }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/10"
              >
                Disconnect
              </motion.button>
            </div>
          ) : (
            <motion.button
              id="navbar-connect-wallet"
              onClick={handleConnect}
              disabled={isConnecting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-sm py-2 px-4"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting…
                </span>
              ) : (
                "🦊 Connect Wallet"
              )}
            </motion.button>
          )}

          {/* Mobile hamburger */}
          <button
            id="navbar-mobile-menu"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-dark-900/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400"
                    }`
                  }
                >
                  <span>{link.icon}</span>{link.label}
                </NavLink>
              ))}
              <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-2">
                <UGFBadge /><span className="badge-success">✅ No ETH</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

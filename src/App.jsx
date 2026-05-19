import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Achievements from "./pages/Achievements";
import Verify from "./pages/Verify";
import AdminPanel from "./pages/AdminPanel";

import { useWallet } from "./context/WalletContext";

export default function App() {
  const { isConnected } = useWallet();

  return (
    <>
      <Navbar />

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Landing />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isConnected ? <Dashboard /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/achievements"
          element={
            isConnected ? <Achievements /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/verify"
          element={
            isConnected ? <Verify /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin"
          element={
            isConnected ? <AdminPanel /> : <Navigate to="/" replace />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}
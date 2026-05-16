import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Achievements from "./pages/Achievements";
import Verify from "./pages/Verify";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"             element={<Landing />} />
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/verify"       element={<Verify />} />
        <Route path="/admin"        element={<AdminPanel />} />
        {/* Catch-all */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}

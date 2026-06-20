import { useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import api from "../services/api";

const ALL_24_FORMS = [
  { key: "postMedical", label: "Post Medical Evaluation" },
  { key: "eyeExam", label: "Eye Examination" },
  { key: "form33", label: "Form No. 33 (Fitness)" },
  { key: "healthRegister", label: "Form No. 32 (Health Register)" },
  { key: "xrayReport", label: "X-Ray Report" },
  ...Array.from({ length: 19 }, (_, i) => {
    const num = String(i + 6).padStart(2, "0");
    return { key: `form${num}`, label: `Medical Form ${num} (Placeholder)` };
  })
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("employees");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add Employee form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("employee");

  // Form Access states
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserAccess, setSelectedUserAccess] = useState([]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data || []);
      
      if (res.data.length > 0 && !selectedUserId) {
        setSelectedUserId(res.data[0]._id);
        setSelectedUserAccess(res.data[0].formAccess || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load user list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const user = users.find((u) => u._id === selectedUserId);
    if (user) {
      setSelectedUserAccess(user.formAccess || []);
    }
  }, [selectedUserId, users]);

  async function handleAddEmployee(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/users", {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      setSuccess("Employee account created successfully!");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("employee");
      await fetchUsers();
    } catch (err) {
      console.error("Create employee failed:", err);
      setError(err.response?.data?.message || "Failed to create user account.");
    }
  }

  async function handleToggleStatus(userId, currentStatus) {
    setError("");
    setSuccess("");
    try {
      const res = await api.put(`/users/${userId}/access`, {
        isActive: !currentStatus
      });
      setSuccess(res.data.message || "User status updated.");
      await fetchUsers();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setError(err.response?.data?.message || "Failed to change user status.");
    }
  }

  async function handleCheckboxChange(formKey) {
    let updatedAccess = [...selectedUserAccess];
    if (updatedAccess.includes(formKey)) {
      updatedAccess = updatedAccess.filter((k) => k !== formKey);
    } else {
      updatedAccess.push(formKey);
    }
    setSelectedUserAccess(updatedAccess);
  }

  async function handleSaveAccess(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await api.put(`/users/${selectedUserId}/access`, {
        formAccess: selectedUserAccess
      });
      setSuccess(res.data.message || "Permissions updated successfully!");
      await fetchUsers();
    } catch (err) {
      console.error("Save access failed:", err);
      setError(err.response?.data?.message || "Failed to save form access permissions.");
    }
  }

  const handleSelectAll = (category) => {
    const isDoctorOrAdmin = users.find(u => u._id === selectedUserId)?.role !== "employee";
    if (isDoctorOrAdmin) return;
    
    const keysToSelect = category === "built" 
      ? ALL_24_FORMS.slice(0, 5).map(f => f.key)
      : ALL_24_FORMS.slice(5).map(f => f.key);
    
    const newAccess = Array.from(new Set([...selectedUserAccess, ...keysToSelect]));
    setSelectedUserAccess(newAccess);
  };

  const handleDeselectAll = (category) => {
    const isDoctorOrAdmin = users.find(u => u._id === selectedUserId)?.role !== "employee";
    if (isDoctorOrAdmin) return;

    const keysToRemove = category === "built"
      ? ALL_24_FORMS.slice(0, 5).map(f => f.key)
      : ALL_24_FORMS.slice(5).map(f => f.key);

    const newAccess = selectedUserAccess.filter(k => !keysToRemove.includes(k));
    setSelectedUserAccess(newAccess);
  };

  const builtForms = ALL_24_FORMS.slice(0, 5);
  const placeholderForms = ALL_24_FORMS.slice(5);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight font-sans">Admin Panel</h1>
            <p className="text-sm text-slate-500 mt-1">Manage employee accounts, toggle roles, and customize medical form access rights.</p>
          </div>
          
          {/* Redesigned Tab Navigation - Pill Button style */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 self-start shrink-0">
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === "employees" ? "bg-white text-slate-900 shadow-xxs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Employees List
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === "add" ? "bg-white text-slate-900 shadow-xxs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Add Employee
            </button>
            <button
              onClick={() => setActiveTab("access")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === "access" ? "bg-white text-slate-900 shadow-xxs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Form Access Rights
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 font-semibold animate-fade-in">
            {success}
          </div>
        )}

        {loading && users.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Loading directory...</div>
        ) : (
          <main className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm min-h-[400px]">
            
            {/* TAB 1: Employees List with Avatars & Toggle Switches */}
            {activeTab === "employees" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Employee Directory</h2>
                <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-xxs">
                  <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Employee Details</th>
                        <th className="px-6 py-4 hidden md:table-cell">Email Address</th>
                        <th className="px-6 py-4">System Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Access Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/20 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* Avatar Initials Circle */}
                              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-brand border border-blue-100 font-bold text-sm shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-800 truncate">{u.name}</span>
                                <span className="text-xxs text-slate-400 font-medium md:hidden mt-0.5 truncate">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell text-slate-500 font-mono text-xs">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase border ${
                              u.role === "admin" ? "bg-red-50 text-red-700 border-red-200/50" :
                              u.role === "doctor" ? "bg-blue-50 text-blue-700 border-blue-200/50" :
                              "bg-slate-50 text-slate-700 border-slate-200"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              u.isActive ? "text-green-600" : "text-slate-400"
                            }`}>
                              <span className={`h-2.5 w-2.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-slate-300"}`}></span>
                              {u.isActive ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.role === "admin" ? (
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">Admin</span>
                            ) : (
                              /* Toggle Switch */
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u._id, u.isActive)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                  u.isActive ? "bg-brand" : "bg-slate-200"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    u.isActive ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Add Employee */}
            {activeTab === "add" && (
              <form onSubmit={handleAddEmployee} className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">Create User Account</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Add a new clinician, staff member, or admin to the workspace.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="field-label" htmlFor="new-name">Full Name</label>
                    <input
                      id="new-name"
                      type="text"
                      className="input"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="new-email">Email Address</label>
                    <input
                      id="new-email"
                      type="email"
                      className="input"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. employee@astermedcare.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="new-password">Password</label>
                    <input
                      id="new-password"
                      type="password"
                      className="input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">System Role</label>
                    <select
                      className="input"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value="employee">Employee / Staff</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="button-primary px-6 mt-4">Create Account</button>
              </form>
            )}

            {/* TAB 3: Form Access Control grouped by Categories */}
            {activeTab === "access" && (
              <form onSubmit={handleSaveAccess} className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Access Control Permissions</h2>
                    <p className="mt-1 text-sm text-slate-500">Configure which of the 24 forms this staff member can access.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="user-select">Select User:</label>
                    <select
                      id="user-select"
                      className="input !py-1.5 !px-3 text-xs max-w-xs font-bold"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Built Forms Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Built Forms</h3>
                      <p className="text-xxs text-slate-400 mt-0.5">Primary forms currently active in system evaluations.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAll("built")}
                        className="px-2.5 py-1 text-xxs font-bold text-brand hover:bg-blue-50 rounded transition border border-transparent hover:border-blue-100/50"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeselectAll("built")}
                        className="px-2.5 py-1 text-xxs font-bold text-slate-500 hover:bg-slate-100 rounded transition border border-transparent"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                    {builtForms.map((formObj) => {
                      const isChecked = selectedUserAccess.includes(formObj.key);
                      const isDoctorOrAdmin = users.find(u => u._id === selectedUserId)?.role !== "employee";
                      
                      return (
                        <div
                          key={formObj.key}
                          onClick={() => !isDoctorOrAdmin && handleCheckboxChange(formObj.key)}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition cursor-pointer select-none ${
                            isDoctorOrAdmin ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed" :
                            isChecked
                              ? "bg-blue-50/30 border-brand/50 shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                            checked={isChecked || isDoctorOrAdmin}
                            disabled={isDoctorOrAdmin}
                            onChange={() => {}}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{formObj.label}</span>
                            <span className="text-xxs text-slate-400 font-mono mt-0.5">{formObj.key}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming/Placeholder Forms Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upcoming & Placeholder Forms</h3>
                      <p className="text-xxs text-slate-400 mt-0.5">Template definitions awaiting integration.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAll("upcoming")}
                        className="px-2.5 py-1 text-xxs font-bold text-brand hover:bg-blue-50 rounded transition border border-transparent hover:border-blue-100/50"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeselectAll("upcoming")}
                        className="px-2.5 py-1 text-xxs font-bold text-slate-500 hover:bg-slate-100 rounded transition border border-transparent"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                    {placeholderForms.map((formObj) => {
                      const isChecked = selectedUserAccess.includes(formObj.key);
                      const isDoctorOrAdmin = users.find(u => u._id === selectedUserId)?.role !== "employee";
                      
                      return (
                        <div
                          key={formObj.key}
                          onClick={() => !isDoctorOrAdmin && handleCheckboxChange(formObj.key)}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition cursor-pointer select-none ${
                            isDoctorOrAdmin ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed" :
                            isChecked
                              ? "bg-blue-50/30 border-brand/50 shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                            checked={isChecked || isDoctorOrAdmin}
                            disabled={isDoctorOrAdmin}
                            onChange={() => {}}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{formObj.label}</span>
                            <span className="text-xxs text-slate-400 font-mono mt-0.5">{formObj.key}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                  <button type="submit" className="button-primary px-6">Save Permissions</button>
                  <p className="text-xs text-slate-400 italic font-medium">Note: Doctors and Admins always bypass form access controls and have full permissions.</p>
                </div>
              </form>
            )}

          </main>
        )}
      </div>
    </AppShell>
  );
}

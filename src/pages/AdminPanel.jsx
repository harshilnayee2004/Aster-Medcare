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
      
      // Auto-select first user if none selected
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
      // Reset form
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("employee");
      // Reload user list
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
      console.error("Failed to update status:", err);
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

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-line pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations Panel</h1>
            <p className="mt-1 text-sm text-slate-500">Manage employee accounts, toggle roles, and customize medical form access rights.</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-line self-start">
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "employees" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "add" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Add Employee
            </button>
            <button
              onClick={() => setActiveTab("access")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "access" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Form Access Rights
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 font-semibold">
            {success}
          </div>
        )}

        {loading && users.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading credentials...</div>
        ) : (
          <main className="bg-white rounded-xl border border-line p-6 sm:p-8 shadow-soft min-h-[400px]">
            
            {/* TAB 1: Employees List */}
            {activeTab === "employees" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Employee Directory</h2>
                <div className="overflow-hidden border border-line rounded-xl">
                  <table className="min-w-full divide-y divide-line text-sm text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/40 transition">
                          <td className="px-6 py-4 font-semibold text-slate-800">{u.name}</td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xxs font-bold uppercase border ${
                              u.role === "admin" ? "bg-red-50 text-red-700 border-red-200" :
                              u.role === "doctor" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-slate-50 text-slate-700 border-slate-200"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              u.isActive ? "text-green-600" : "text-slate-400"
                            }`}>
                              <span className={`h-2.5 w-2.5 rounded-full ${u.isActive ? "bg-green-600" : "bg-slate-300"}`}></span>
                              {u.isActive ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.role === "admin" ? (
                              <span className="text-xs text-slate-400 font-medium italic">System Reserved</span>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(u._id, u.isActive)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                  u.isActive
                                    ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200"
                                    : "bg-brand text-white border-brand hover:bg-blue-600"
                                }`}
                              >
                                {u.isActive ? "Deactivate" : "Activate"}
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
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Create User Account</h2>
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
                <button type="submit" className="button-primary px-6">Create Account</button>
              </form>
            )}

            {/* TAB 3: Form Access Control */}
            {activeTab === "access" && (
              <form onSubmit={handleSaveAccess} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Access Control Permissions</h2>
                    <p className="mt-1 text-sm text-slate-500">Configure which of the 24 forms this staff member can access.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="user-select">Select User:</label>
                    <select
                      id="user-select"
                      className="input !py-1.5 !px-3 text-xs max-w-xs font-semibold"
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 max-w-5xl">
                  {ALL_24_FORMS.map((formObj) => {
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
                          className="h-4.5 w-4.5 rounded border-slate-300 text-brand focus:ring-brand"
                          checked={isChecked || isDoctorOrAdmin}
                          disabled={isDoctorOrAdmin}
                          onChange={() => {}} // Controlled by wrapper div click
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{formObj.label}</span>
                          <span className="text-xxs text-slate-400 font-mono mt-0.5">{formObj.key}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                  <button type="submit" className="button-primary px-6">Save Permissions</button>
                  <p className="text-xs text-slate-400 italic">Note: Doctors and Admins always bypass form access controls and have full permissions.</p>
                </div>
              </form>
            )}

          </main>
        )}
      </div>
    </AppShell>
  );
}

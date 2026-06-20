import React from "react";

/**
 * Reusable DateField component with a quick-action "Today" button.
 * Supports standard "date" and "datetime-local" input formats.
 */
export default function DateField({ label, value, onChange, type = "date", required = false }) {
  const inputId = label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : "date-input";

  function handleSetToday() {
    const today = new Date();
    let formatted = "";

    if (type === "datetime-local") {
      // Format: YYYY-MM-DDTHH:mm (taking timezone offset into account)
      const tzOffsetOffsetMs = today.getTimezoneOffset() * 60000;
      const localTime = new Date(today.getTime() - tzOffsetOffsetMs);
      formatted = localTime.toISOString().slice(0, 16);
    } else {
      // Format: YYYY-MM-DD
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      formatted = `${year}-${month}-${day}`;
    }

    onChange(formatted);
  }

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        {label && (
          <label className="field-label font-semibold text-slate-700" htmlFor={inputId}>
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={handleSetToday}
          className="text-xxs font-bold uppercase tracking-wider text-brand hover:text-blue-700 active:scale-95 transition"
        >
          Today
        </button>
      </div>
      <input
        id={inputId}
        type={type}
        className="input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

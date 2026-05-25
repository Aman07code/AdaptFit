const { useEffect, useMemo, useState } = React;
const h = React.createElement;

const STORAGE_AUTH = "adaptfit.auth";
const STORAGE_API_BASE = "adaptfit.apiBase";
const DEFAULT_API_BASE = "http://localhost:8080";

const ENERGY_LEVELS = ["LOW", "MEDIUM", "HIGH"];
const RECOVERY_LEVELS = ["LOW", "MEDIUM", "HIGH"];
const GOALS = ["FAT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS"];
const WORKOUT_TYPES = ["LIGHT", "STRENGTH", "CARDIO", "COMPACT", "MOBILITY", "MIXED"];
const INTENSITIES = ["LOW", "MODERATE", "HIGH"];
const EQUIPMENT = ["NONE", "DUMBBELLS", "RESISTANCE_BAND", "JUMP_ROPE", "KETTLEBELL"];

const emptyExercise = {
  name: "",
  description: "",
  workoutType: "STRENGTH",
  equipment: "NONE",
  muscleGroup: "",
  durationMinutes: 12,
  intensity: "MODERATE",
  caloriesEstimate: 100
};

const defaultRecommendation = {
  energyLevel: "HIGH",
  recoveryLevel: "HIGH",
  goal: "MUSCLE_GAIN",
  availableEquipment: ["NONE", "DUMBBELLS"],
  availableTimeMinutes: 35
};

const defaultHistory = {
  userId: "",
  workoutName: "",
  goal: "GENERAL_FITNESS",
  workoutType: "MIXED",
  exerciseIds: [],
  actualDurationMinutes: 30,
  energyLevel: "MEDIUM",
  recoveryLevel: "MEDIUM",
  performedAt: "",
  feedback: "",
  notes: ""
};

function formatEnum(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeApiBase(value) {
  return String(value || DEFAULT_API_BASE).trim().replace(/\/+$/, "");
}

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_AUTH) || "null");
  } catch (error) {
    return null;
  }
}

function Icon({ name }) {
  const icons = {
    pulse: ["M4 12h4l2-7 4 14 2-7h4"],
    spark: ["M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"],
    dumbbell: ["M3 9h3v6H3V9zm15 0h3v6h-3V9zM8 11h8v2H8v-2zM6 7h2v10H6V7zm10 0h2v10h-2V7z"],
    history: ["M4 5v5h5M5 10a7 7 0 1 0 2-5M12 7v5l3 2"],
    user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"],
    plus: ["M12 5v14M5 12h14"],
    edit: ["M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"],
    trash: ["M5 7h14M10 11v6M14 11v6M7 7l1 14h8l1-14M9 7V4h6v3"],
    save: ["M5 4h12l2 2v14H5V4zM8 4v6h8V4M8 20v-6h8v6"],
    refresh: ["M20 7v5h-5M4 17v-5h5M18 12a6 6 0 0 0-10-4M6 12a6 6 0 0 0 10 4"],
    check: ["M5 13l4 4L19 7"],
    alert: ["M12 3l9 16H3L12 3zM12 9v4M12 17h.01"],
    clock: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v5l3 2"],
    bolt: ["M13 2L4 14h7l-1 8 9-12h-7l1-8z"],
    logout: ["M10 17l5-5-5-5M15 12H3M21 4v16h-7"],
    settings: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4"]
  };

  return h(
    "svg",
    {
      className: "icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    (icons[name] || icons.pulse).map((d, index) => h("path", { key: index, d }))
  );
}

function Button({ children, icon, variant = "primary", className = "", ...props }) {
  return h(
    "button",
    {
      ...props,
      className: `btn btn-${variant} ${className}`.trim()
    },
    icon ? h(Icon, { name: icon }) : null,
    children ? h("span", null, children) : null
  );
}

function Field({ label, children, className = "" }) {
  return h(
    "label",
    { className: `field ${className}`.trim() },
    h("span", null, label),
    children
  );
}

function SelectField({ label, value, onChange, options }) {
  return h(
    Field,
    { label },
    h(
      "select",
      { value, onChange: event => onChange(event.target.value) },
      options.map(option => h("option", { key: option, value: option }, formatEnum(option)))
    )
  );
}

function Segmented({ label, value, options, onChange }) {
  return h(
    "div",
    { className: "segmented-group" },
    h("span", { className: "control-label" }, label),
    h(
      "div",
      { className: "segmented", role: "group", "aria-label": label },
      options.map(option =>
        h(
          "button",
          {
            key: option,
            type: "button",
            className: value === option ? "is-selected" : "",
            onClick: () => onChange(option)
          },
          formatEnum(option)
        )
      )
    )
  );
}

function EquipmentPicker({ value, onChange }) {
  function toggle(item) {
    const selected = value.includes(item)
      ? value.filter(current => current !== item)
      : [...value, item];
    onChange(selected.length ? selected : ["NONE"]);
  }

  return h(
    "div",
    { className: "equipment-picker" },
    h("span", { className: "control-label" }, "Equipment"),
    h(
      "div",
      { className: "chip-grid" },
      EQUIPMENT.map(item =>
        h(
          "label",
          { key: item, className: `chip ${value.includes(item) ? "is-active" : ""}` },
          h("input", {
            type: "checkbox",
            checked: value.includes(item),
            onChange: () => toggle(item)
          }),
          h("span", null, formatEnum(item))
        )
      )
    )
  );
}

function StatusPill({ status }) {
  const label = status === "connected" ? "Backend connected" : status === "checking" ? "Checking backend" : "Backend offline";
  return h(
    "div",
    { className: `status-pill ${status}` },
    h("span", { className: "status-dot" }),
    label
  );
}

function Toast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  return h(
    "div",
    { className: `toast toast-${toast.type || "info"}`, role: "status" },
    h(Icon, { name: toast.type === "error" ? "alert" : "check" }),
    h("span", null, toast.message),
    h("button", { type: "button", onClick: onClose, "aria-label": "Dismiss" }, "x")
  );
}

function EmptyState({ title, body }) {
  return h(
    "div",
    { className: "empty-state" },
    h("div", { className: "empty-mark" }, h(Icon, { name: "pulse" })),
    h("h3", null, title),
    h("p", null, body)
  );
}

function ProgressRing({ value, max, label }) {
  const safeMax = Math.max(Number(max) || 1, 1);
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), safeMax);
  const percent = safeValue / safeMax;
  const circumference = 2 * Math.PI * 36;
  const dash = circumference * percent;

  return h(
    "div",
    { className: "progress-ring", "aria-label": label },
    h(
      "svg",
      { viewBox: "0 0 92 92" },
      h("circle", { className: "ring-track", cx: "46", cy: "46", r: "36" }),
      h("circle", {
        className: "ring-value",
        cx: "46",
        cy: "46",
        r: "36",
        strokeDasharray: `${dash} ${circumference - dash}`
      })
    ),
    h("div", { className: "ring-label" }, h("strong", null, safeValue), h("span", null, "min"))
  );
}

function Shell({ activeTab, setActiveTab, auth, backendStatus, children }) {
  const tabs = [
    { id: "recommend", label: "Trainer", icon: "spark" },
    { id: "exercises", label: "Exercises", icon: "dumbbell" },
    { id: "history", label: "History", icon: "history" },
    { id: "account", label: "Account", icon: "user" }
  ];

  return h(
    "div",
    { className: "app-shell" },
    h(
      "aside",
      { className: "sidebar" },
      h(
        "div",
        { className: "brand" },
        h("div", { className: "brand-mark" }, h(Icon, { name: "pulse" })),
        h("div", null, h("strong", null, "AdaptFit"), h("span", null, "Trainer"))
      ),
      h(
        "nav",
        { className: "nav-tabs", "aria-label": "Primary" },
        tabs.map(tab =>
          h(
            "button",
            {
              key: tab.id,
              type: "button",
              className: activeTab === tab.id ? "is-active" : "",
              onClick: () => setActiveTab(tab.id)
            },
            h(Icon, { name: tab.icon }),
            h("span", null, tab.label)
          )
        )
      ),
      h(
        "div",
        { className: "sidebar-footer" },
        h(StatusPill, { status: backendStatus }),
        h("div", { className: "user-chip" }, h(Icon, { name: "user" }), auth?.user?.name || "Guest")
      )
    ),
    h(
      "main",
      { className: "main-content" },
      h(
        "header",
        { className: "topbar" },
        h(
          "div",
          null,
          h("p", { className: "eyebrow" }, "Adaptive fitness console"),
          h("h1", null, activeTab === "recommend" ? "Personal trainer" : activeTab === "exercises" ? "Exercise library" : activeTab === "history" ? "Workout history" : "Account")
        ),
        h("div", { className: "topbar-art", "aria-hidden": "true" }, h("span"), h("span"), h("span"))
      ),
      children
    )
  );
}

function RecommendationView({ form, setForm, recommendation, loading, onGenerate, onSave, auth, exercises }) {
  const selectedEquipment = form.availableEquipment;

  return h(
    "section",
    { className: "content-grid trainer-grid" },
    h(
      "form",
      { className: "panel tool-panel", onSubmit: onGenerate },
      h(
        "div",
        { className: "panel-heading" },
        h("div", null, h("h2", null, "Workout signal"), h("p", null, "Energy, recovery, goal, gear, time")),
        h("div", { className: "heading-icon" }, h(Icon, { name: "bolt" }))
      ),
      h(Segmented, {
        label: "Energy",
        value: form.energyLevel,
        options: ENERGY_LEVELS,
        onChange: value => setForm({ ...form, energyLevel: value })
      }),
      h(Segmented, {
        label: "Recovery",
        value: form.recoveryLevel,
        options: RECOVERY_LEVELS,
        onChange: value => setForm({ ...form, recoveryLevel: value })
      }),
      h(SelectField, {
        label: "Goal",
        value: form.goal,
        options: GOALS,
        onChange: value => setForm({ ...form, goal: value })
      }),
      h(EquipmentPicker, {
        value: selectedEquipment,
        onChange: value => setForm({ ...form, availableEquipment: value })
      }),
      h(
        "div",
        { className: "time-control" },
        h("div", null, h("span", { className: "control-label" }, "Available time"), h("strong", null, `${form.availableTimeMinutes} min`)),
        h("input", {
          type: "range",
          min: "5",
          max: "90",
          step: "5",
          value: form.availableTimeMinutes,
          onChange: event => setForm({ ...form, availableTimeMinutes: Number(event.target.value) })
        })
      ),
      h(Button, { type: "submit", icon: "spark", disabled: loading, className: "wide" }, loading ? "Generating" : "Generate workout")
    ),
    h(
      "div",
      { className: "recommendation-space" },
      recommendation
        ? h(RecommendationResult, { recommendation, onSave, auth })
        : h(
            "div",
            { className: "visual-panel" },
            h("div", { className: "kinetic-orbit", "aria-hidden": "true" }, h("span"), h("span"), h("span")),
            h("h2", null, "Ready when the body is"),
            h(
              "div",
              { className: "stat-strip" },
              h("div", null, h("strong", null, exercises.length), h("span", null, "Exercises")),
              h("div", null, h("strong", null, selectedEquipment.length), h("span", null, "Gear")),
              h("div", null, h("strong", null, form.availableTimeMinutes), h("span", null, "Minutes"))
            )
          )
    )
  );
}

function RecommendationResult({ recommendation, onSave, auth }) {
  return h(
    "article",
    { className: "panel result-panel" },
    h(
      "div",
      { className: "result-summary" },
      h(ProgressRing, {
        value: recommendation.estimatedDurationMinutes,
        max: recommendation.availableTimeMinutes,
        label: "Estimated duration"
      }),
      h(
        "div",
        null,
        h("span", { className: "tag accent" }, formatEnum(recommendation.workoutType)),
        h("h2", null, recommendation.recommendationName),
        h("p", null, recommendation.recommendationReason)
      )
    ),
    h(
      "div",
      { className: "metric-row" },
      h("div", null, h("span", null, "Goal"), h("strong", null, formatEnum(recommendation.goal))),
      h("div", null, h("span", null, "Intensity"), h("strong", null, formatEnum(recommendation.intensity))),
      h("div", null, h("span", null, "Equipment"), h("strong", null, recommendation.equipmentUsed.map(formatEnum).join(", ")))
    ),
    h(
      "div",
      { className: "exercise-stack" },
      recommendation.exercises.map(exercise => h(ExerciseMiniCard, { key: exercise.id, exercise }))
    ),
    h(
      "div",
      { className: "panel-actions" },
      h(Button, { type: "button", icon: "save", onClick: onSave, disabled: !auth?.user }, "Save workout")
    )
  );
}

function ExerciseMiniCard({ exercise }) {
  return h(
    "div",
    { className: "mini-card" },
    h("div", { className: `intensity-dot ${String(exercise.intensity).toLowerCase()}` }),
    h("div", null, h("strong", null, exercise.name), h("span", null, `${formatEnum(exercise.muscleGroup)} - ${exercise.durationMinutes} min`)),
    h("span", { className: "tag" }, formatEnum(exercise.equipment))
  );
}

function ExercisesView({ exercises, form, setForm, editingId, setEditingId, onSubmit, onDelete, onEdit, loading }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return exercises;
    }

    return exercises.filter(exercise =>
      [exercise.name, exercise.equipment, exercise.muscleGroup, exercise.workoutType, exercise.intensity]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [exercises, query]);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  return h(
    "section",
    { className: "content-grid library-grid" },
    h(
      "form",
      { className: "panel tool-panel", onSubmit },
      h(
        "div",
        { className: "panel-heading" },
        h("div", null, h("h2", null, editingId ? "Update exercise" : "Add exercise"), h("p", null, "Name, type, gear, duration")),
        h("div", { className: "heading-icon coral" }, h(Icon, { name: "dumbbell" }))
      ),
      h(Field, { label: "Name" }, h("input", { value: form.name, onChange: event => update("name", event.target.value), required: true })),
      h(Field, { label: "Description" }, h("textarea", { value: form.description, onChange: event => update("description", event.target.value), rows: 3 })),
      h(
        "div",
        { className: "form-row" },
        h(SelectField, { label: "Type", value: form.workoutType, options: WORKOUT_TYPES, onChange: value => update("workoutType", value) }),
        h(SelectField, { label: "Intensity", value: form.intensity, options: INTENSITIES, onChange: value => update("intensity", value) })
      ),
      h(
        "div",
        { className: "form-row" },
        h(Field, { label: "Equipment" }, h("input", { value: form.equipment, onChange: event => update("equipment", event.target.value), required: true })),
        h(Field, { label: "Muscle group" }, h("input", { value: form.muscleGroup, onChange: event => update("muscleGroup", event.target.value), required: true }))
      ),
      h(
        "div",
        { className: "form-row" },
        h(Field, { label: "Minutes" }, h("input", { type: "number", min: "1", max: "240", value: form.durationMinutes, onChange: event => update("durationMinutes", Number(event.target.value)), required: true })),
        h(Field, { label: "Calories" }, h("input", { type: "number", min: "0", value: form.caloriesEstimate, onChange: event => update("caloriesEstimate", Number(event.target.value)), required: true }))
      ),
      h(
        "div",
        { className: "panel-actions" },
        h(Button, { type: "submit", icon: editingId ? "save" : "plus", disabled: loading }, editingId ? "Save changes" : "Add exercise"),
        editingId
          ? h(Button, {
              type: "button",
              icon: "refresh",
              variant: "ghost",
              onClick: () => {
                setEditingId(null);
                setForm(emptyExercise);
              }
            }, "Reset")
          : null
      )
    ),
    h(
      "div",
      { className: "panel library-panel" },
      h(
        "div",
        { className: "panel-heading" },
        h("div", null, h("h2", null, "Library"), h("p", null, `${filtered.length} of ${exercises.length} exercises`)),
        h(Field, { label: "Search", className: "compact-field" }, h("input", { value: query, onChange: event => setQuery(event.target.value) }))
      ),
      filtered.length
        ? h(
            "div",
            { className: "exercise-table" },
            filtered.map(exercise =>
              h(
                "div",
                { className: "exercise-row", key: exercise.id },
                h(
                  "div",
                  { className: "exercise-main" },
                  h("strong", null, exercise.name),
                  h("span", null, `${formatEnum(exercise.workoutType)} - ${formatEnum(exercise.muscleGroup)}`)
                ),
                h("span", { className: "tag" }, formatEnum(exercise.equipment)),
                h("span", null, `${exercise.durationMinutes} min`),
                h("span", null, formatEnum(exercise.intensity)),
                h(
                  "div",
                  { className: "row-actions" },
                  h(Button, { type: "button", icon: "edit", variant: "icon", onClick: () => onEdit(exercise), "aria-label": `Edit ${exercise.name}` }),
                  h(Button, { type: "button", icon: "trash", variant: "icon danger", onClick: () => onDelete(exercise.id), "aria-label": `Delete ${exercise.name}` })
                )
              )
            )
          )
        : h(EmptyState, { title: "No exercises", body: "Add exercises or start the backend seed data." })
    )
  );
}

function HistoryView({ auth, exercises, history, form, setForm, onSubmit, onRefresh }) {
  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  function toggleExercise(id) {
    const next = form.exerciseIds.includes(id)
      ? form.exerciseIds.filter(current => current !== id)
      : [...form.exerciseIds, id];
    update("exerciseIds", next);
  }

  return h(
    "section",
    { className: "content-grid history-grid" },
    h(
      "form",
      { className: "panel tool-panel", onSubmit },
      h(
        "div",
        { className: "panel-heading" },
        h("div", null, h("h2", null, "Save session"), h("p", null, auth?.user ? auth.user.name : "User id required")),
        h("div", { className: "heading-icon amber" }, h(Icon, { name: "history" }))
      ),
      h(
        "div",
        { className: "form-row" },
        h(Field, { label: "User id" }, h("input", { type: "number", min: "1", value: form.userId, onChange: event => update("userId", event.target.value), required: true })),
        h(Field, { label: "Minutes" }, h("input", { type: "number", min: "1", max: "240", value: form.actualDurationMinutes, onChange: event => update("actualDurationMinutes", Number(event.target.value)), required: true }))
      ),
      h(Field, { label: "Workout name" }, h("input", { value: form.workoutName, onChange: event => update("workoutName", event.target.value), required: true })),
      h(
        "div",
        { className: "form-row" },
        h(SelectField, { label: "Goal", value: form.goal, options: GOALS, onChange: value => update("goal", value) }),
        h(SelectField, { label: "Type", value: form.workoutType, options: WORKOUT_TYPES, onChange: value => update("workoutType", value) })
      ),
      h(
        "div",
        { className: "form-row" },
        h(SelectField, { label: "Energy", value: form.energyLevel, options: ENERGY_LEVELS, onChange: value => update("energyLevel", value) }),
        h(SelectField, { label: "Recovery", value: form.recoveryLevel, options: RECOVERY_LEVELS, onChange: value => update("recoveryLevel", value) })
      ),
      h(Field, { label: "Performed at" }, h("input", { type: "datetime-local", value: form.performedAt, onChange: event => update("performedAt", event.target.value) })),
      h(
        "div",
        { className: "exercise-picker" },
        h("span", { className: "control-label" }, "Exercises"),
        h(
          "div",
          { className: "history-exercise-grid" },
          exercises.map(exercise =>
            h(
              "label",
              { key: exercise.id, className: form.exerciseIds.includes(exercise.id) ? "select-card is-active" : "select-card" },
              h("input", { type: "checkbox", checked: form.exerciseIds.includes(exercise.id), onChange: () => toggleExercise(exercise.id) }),
              h("strong", null, exercise.name),
              h("span", null, `${exercise.durationMinutes} min`)
            )
          )
        )
      ),
      h(Field, { label: "Feedback" }, h("textarea", { rows: 3, value: form.feedback, onChange: event => update("feedback", event.target.value) })),
      h(Button, { type: "submit", icon: "save", className: "wide" }, "Save history")
    ),
    h(
      "div",
      { className: "panel history-panel" },
      h(
        "div",
        { className: "panel-heading" },
        h("div", null, h("h2", null, "Timeline"), h("p", null, `${history.length} sessions`)),
        h(Button, { type: "button", icon: "refresh", variant: "ghost", onClick: onRefresh }, "Refresh")
      ),
      history.length
        ? h(
            "div",
            { className: "timeline" },
            history.map(item =>
              h(
                "article",
                { className: "timeline-item", key: item.id },
                h("div", { className: "timeline-pin" }),
                h(
                  "div",
                  null,
                  h("div", { className: "timeline-top" }, h("strong", null, item.workoutName), h("span", null, item.performedAt ? item.performedAt.replace("T", " ").slice(0, 16) : "")),
                  h("p", null, `${formatEnum(item.goal)} - ${formatEnum(item.workoutType)} - ${item.actualDurationMinutes} min`),
                  item.feedback ? h("blockquote", null, item.feedback) : null,
                  h(
                    "div",
                    { className: "timeline-exercises" },
                    (item.exercises || []).map(exercise => h("span", { key: exercise.id }, exercise.name))
                  )
                )
              )
            )
          )
        : h(EmptyState, { title: "No history", body: "Saved sessions appear here." })
    )
  );
}

function AccountView({ apiBase, setApiBase, auth, onLogin, onRegister, onLogout }) {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [register, setRegister] = useState({ name: "", email: "", password: "" });
  const [draftApiBase, setDraftApiBase] = useState(apiBase);

  function saveApiBase(event) {
    event.preventDefault();
    setApiBase(normalizeApiBase(draftApiBase));
  }

  return h(
    "section",
    { className: "content-grid account-grid" },
    h(
      "div",
      { className: "panel profile-panel" },
      h(
        "div",
        { className: "profile-card" },
        h("div", { className: "avatar" }, h(Icon, { name: "user" })),
        h("div", null, h("span", null, auth?.user ? "Signed in" : "Guest"), h("h2", null, auth?.user?.name || "AdaptFit user"), h("p", null, auth?.user?.email || "No active session"))
      ),
      auth?.user ? h(Button, { type: "button", icon: "logout", variant: "ghost", onClick: onLogout }, "Sign out") : null,
      h(
        "form",
        { className: "api-form", onSubmit: saveApiBase },
        h(Field, { label: "Backend URL" }, h("input", { value: draftApiBase, onChange: event => setDraftApiBase(event.target.value) })),
        h(Button, { type: "submit", icon: "settings" }, "Save URL")
      )
    ),
    h(
      "form",
      { className: "panel auth-panel", onSubmit: event => onLogin(event, login) },
      h("div", { className: "panel-heading" }, h("div", null, h("h2", null, "Login"), h("p", null, "Email and password"))),
      h(Field, { label: "Email" }, h("input", { type: "email", value: login.email, onChange: event => setLogin({ ...login, email: event.target.value }), required: true })),
      h(Field, { label: "Password" }, h("input", { type: "password", value: login.password, onChange: event => setLogin({ ...login, password: event.target.value }), required: true })),
      h(Button, { type: "submit", icon: "user", className: "wide" }, "Login")
    ),
    h(
      "form",
      { className: "panel auth-panel", onSubmit: event => onRegister(event, register) },
      h("div", { className: "panel-heading" }, h("div", null, h("h2", null, "Register"), h("p", null, "Create a profile"))),
      h(Field, { label: "Name" }, h("input", { value: register.name, onChange: event => setRegister({ ...register, name: event.target.value }), required: true })),
      h(Field, { label: "Email" }, h("input", { type: "email", value: register.email, onChange: event => setRegister({ ...register, email: event.target.value }), required: true })),
      h(Field, { label: "Password" }, h("input", { type: "password", minLength: 8, value: register.password, onChange: event => setRegister({ ...register, password: event.target.value }), required: true })),
      h(Button, { type: "submit", icon: "plus", className: "wide" }, "Create account")
    )
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("recommend");
  const [apiBase, setApiBaseState] = useState(() => normalizeApiBase(localStorage.getItem(STORAGE_API_BASE) || DEFAULT_API_BASE));
  const [auth, setAuth] = useState(getStoredAuth);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [toast, setToast] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationForm, setRecommendationForm] = useState(defaultRecommendation);
  const [exerciseForm, setExerciseForm] = useState(emptyExercise);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [historyForm, setHistoryForm] = useState(defaultHistory);
  const [loading, setLoading] = useState({ exercises: false, recommendation: false });

  useEffect(() => {
    loadExercises();
  }, [apiBase]);

  useEffect(() => {
    const userId = auth?.user?.id || "";
    setHistoryForm(current => ({ ...current, userId }));
    if (userId) {
      loadHistory(userId);
    }
  }, [auth, apiBase]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  function setApiBase(value) {
    const normalized = normalizeApiBase(value);
    localStorage.setItem(STORAGE_API_BASE, normalized);
    setApiBaseState(normalized);
    showToast("Backend URL saved");
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(auth?.token ? { Authorization: `${auth.tokenType || "Bearer"} ${auth.token}` } : {}),
        ...(options.headers || {})
      }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const validation = data?.validationErrors ? Object.values(data.validationErrors).join(" ") : "";
      throw new Error([data?.message, validation].filter(Boolean).join(" ") || "Request failed");
    }

    return data;
  }

  async function loadExercises() {
    setBackendStatus("checking");
    setLoading(current => ({ ...current, exercises: true }));
    try {
      const data = await apiRequest("/api/exercises");
      setExercises(data || []);
      setBackendStatus("connected");
    } catch (error) {
      setBackendStatus("offline");
      setExercises([]);
    } finally {
      setLoading(current => ({ ...current, exercises: false }));
    }
  }

  async function loadHistory(userId = historyForm.userId) {
    if (!userId) {
      setHistory([]);
      return;
    }

    try {
      const data = await apiRequest(`/api/workout-history/users/${userId}`);
      setHistory(data || []);
      setBackendStatus("connected");
    } catch (error) {
      setHistory([]);
      showToast(error.message, "error");
    }
  }

  async function handleLogin(event, form) {
    event.preventDefault();
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setAuth(data);
      localStorage.setItem(STORAGE_AUTH, JSON.stringify(data));
      showToast("Logged in");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleRegister(event, form) {
    event.preventDefault();
    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setAuth(data);
      localStorage.setItem(STORAGE_AUTH, JSON.stringify(data));
      showToast("Account created");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function handleLogout() {
    setAuth(null);
    localStorage.removeItem(STORAGE_AUTH);
    setHistory([]);
    showToast("Signed out");
  }

  async function handleGenerate(event) {
    event.preventDefault();
    setLoading(current => ({ ...current, recommendation: true }));
    try {
      const data = await apiRequest("/api/recommendations/workouts", {
        method: "POST",
        body: JSON.stringify(recommendationForm)
      });
      setRecommendation(data);
      showToast("Workout generated");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(current => ({ ...current, recommendation: false }));
    }
  }

  async function handleSaveRecommendation() {
    if (!auth?.user || !recommendation) {
      showToast("Login before saving workouts", "error");
      return;
    }

    try {
      await apiRequest("/api/workout-history", {
        method: "POST",
        body: JSON.stringify({
          userId: auth.user.id,
          workoutName: recommendation.recommendationName,
          goal: recommendation.goal,
          workoutType: recommendation.workoutType,
          exerciseIds: recommendation.exercises.map(exercise => exercise.id),
          actualDurationMinutes: recommendation.estimatedDurationMinutes,
          energyLevel: recommendationForm.energyLevel,
          recoveryLevel: recommendationForm.recoveryLevel,
          performedAt: new Date().toISOString().slice(0, 19),
          feedback: "",
          notes: recommendation.recommendationReason
        })
      });
      showToast("Workout saved");
      loadHistory(auth.user.id);
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleExerciseSubmit(event) {
    event.preventDefault();
    setLoading(current => ({ ...current, exercises: true }));
    try {
      await apiRequest(editingExerciseId ? `/api/exercises/${editingExerciseId}` : "/api/exercises", {
        method: editingExerciseId ? "PUT" : "POST",
        body: JSON.stringify(exerciseForm)
      });
      setExerciseForm(emptyExercise);
      setEditingExerciseId(null);
      await loadExercises();
      showToast(editingExerciseId ? "Exercise updated" : "Exercise added");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(current => ({ ...current, exercises: false }));
    }
  }

  function handleEditExercise(exercise) {
    setEditingExerciseId(exercise.id);
    setExerciseForm({
      name: exercise.name || "",
      description: exercise.description || "",
      workoutType: exercise.workoutType || "STRENGTH",
      equipment: exercise.equipment || "NONE",
      muscleGroup: exercise.muscleGroup || "",
      durationMinutes: exercise.durationMinutes || 12,
      intensity: exercise.intensity || "MODERATE",
      caloriesEstimate: exercise.caloriesEstimate || 100
    });
  }

  async function handleDeleteExercise(id) {
    if (!window.confirm("Delete this exercise?")) {
      return;
    }

    try {
      await apiRequest(`/api/exercises/${id}`, { method: "DELETE" });
      await loadExercises();
      showToast("Exercise deleted");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleHistorySubmit(event) {
    event.preventDefault();
    try {
      await apiRequest("/api/workout-history", {
        method: "POST",
        body: JSON.stringify({
          ...historyForm,
          userId: Number(historyForm.userId),
          performedAt: historyForm.performedAt || null
        })
      });
      showToast("History saved");
      setHistoryForm({
        ...defaultHistory,
        userId: auth?.user?.id || historyForm.userId
      });
      loadHistory(auth?.user?.id || historyForm.userId);
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  const currentView = activeTab === "recommend"
    ? h(RecommendationView, {
        form: recommendationForm,
        setForm: setRecommendationForm,
        recommendation,
        loading: loading.recommendation,
        onGenerate: handleGenerate,
        onSave: handleSaveRecommendation,
        auth,
        exercises
      })
    : activeTab === "exercises"
      ? h(ExercisesView, {
          exercises,
          form: exerciseForm,
          setForm: setExerciseForm,
          editingId: editingExerciseId,
          setEditingId: setEditingExerciseId,
          onSubmit: handleExerciseSubmit,
          onDelete: handleDeleteExercise,
          onEdit: handleEditExercise,
          loading: loading.exercises
        })
      : activeTab === "history"
        ? h(HistoryView, {
            auth,
            exercises,
            history,
            form: historyForm,
            setForm: setHistoryForm,
            onSubmit: handleHistorySubmit,
            onRefresh: () => loadHistory(auth?.user?.id || historyForm.userId)
          })
        : h(AccountView, {
            apiBase,
            setApiBase,
            auth,
            onLogin: handleLogin,
            onRegister: handleRegister,
            onLogout: handleLogout
          });

  return h(
    React.Fragment,
    null,
    h(Shell, { activeTab, setActiveTab, auth, backendStatus }, currentView),
    h(Toast, { toast, onClose: () => setToast(null) })
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));

import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  layout("routes/app-layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("patients", "routes/patients.tsx"),
    route("patients/:patientId", "routes/patient-detail.tsx"),
    route("medicines", "routes/medicines.tsx"),
    route("medicines/:medicineId", "routes/medicine-detail.tsx"),
    route("profile", "routes/profile.tsx"),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

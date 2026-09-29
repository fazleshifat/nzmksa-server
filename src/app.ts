import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminUserRoutes from "./routes/adminUserRoutes";
import adminProfileRoutes from "./routes/adminProfileRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();
app.set("trust proxy", true);

app.use(
    cors({
        origin: process.env.CLIENT_URL?.split(",") || "*",
    })
);

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "Absher backend API is running",
    });
});

/* ============================================================
   Super ADMIN ROUTES
============================================================ */

app.use(
    "/api/admin/sessions",
    sessionRoutes
);

/* ============================================================
   ADMIN ROUTES
============================================================ */

app.use(
    "/api/admin/auth",
    adminAuthRoutes
);

app.use(
    "/api/admin/users",
    adminUserRoutes
);

app.use(
    "/api/admin/all-admins",
    adminRoutes
);

app.use(
    "/api/admin/profile",
    adminProfileRoutes
);

/* ============================================================
   USER ROUTES
============================================================ */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/uploads",
    uploadRoutes
);

export default app;
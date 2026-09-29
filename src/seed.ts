import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { connectDB } from "./config/db";
import { Admin } from "./models/Admin";

const seedSuperAdmin = async () => {
    try {
        await connectDB();

        const email = "superadmin@gmail.com";
        const password = "890ioP";

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await Admin.updateOne(
            { email },
            {
                $set: {
                    name: "Super Admin",
                    email,
                    password: hashedPassword,
                    role: "superadmin",
                    active: true,
                },
            },
            { upsert: true }
        );

        console.log("\n=================================");
        console.log("Super Admin seeded successfully!");
        console.log("=================================");
        console.log(`Email: ${email}`);
        console.log("Role: superadmin");
        console.log(
            result.upsertedCount === 1
                ? "Created: Yes"
                : "Created: No (already existed, updated)"
        );
        console.log("=================================\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Super Admin seed failed:", error);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        process.exit(1);
    }
};

seedSuperAdmin();
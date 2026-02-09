"use server";

import { seedBlogs } from "@/lib/seed-blogs";

export async function runBlogSeed() {
    try {
        await seedBlogs();
        return { success: true, message: "Blogs seeded successfully!" };
    } catch (error) {
        console.error("Error seeding blogs:", error);
        return { success: false, message: "Failed to seed blogs." };
    }
}

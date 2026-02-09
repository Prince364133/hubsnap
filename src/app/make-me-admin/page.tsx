"use client";

import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function MakeMeAdminPage() {
    const { user } = useAuth();
    const [status, setStatus] = useState("");

    const handleMakeAdmin = async () => {
        if (!user) return;
        setStatus("Updating...");
        try {
            await dbService.saveUserProfile(user.uid, { role: "admin" });
            setStatus("Success! You are now an admin. Refresh the page.");
        } catch (e: any) {
            setStatus("Error: " + e.message);
        }
    };

    return (
        <div className="p-20 text-center">
            <h1 className="text-2xl font-bold mb-4">Admin Privileges</h1>
            <p className="mb-4">Current User: {user?.email}</p>
            <Button onClick={handleMakeAdmin}>Make Me Admin</Button>
            <p className="mt-4 font-bold">{status}</p>
        </div>
    );
}

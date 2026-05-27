import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/settings")({
    component: Settings,
});

function Settings() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", address: "", phone: "", terms: "" });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.id) return;
            try {
                const headers = await getAuthHeaders(getToken);
                // Changed from /settings/${user.id} to just /settings
                const response = await fetch(`${API_URL}/settings`, { headers });

                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setFormData({
                            name: data.name || "",
                            address: data.address || "",
                            phone: data.phone || "",
                            terms: data.terms || ""
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            }
        };
        fetchSettings();
    }, [user, getToken]);

    const saveSettings = async () => {
        try {
            const headers = await getAuthHeaders(getToken);
            const response = await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, userId: user?.id })
            });

            if (response.ok) {
                navigate({ to: "/dashboard/bookings" });
            } else {
                console.error("Failed to save settings");
            }
        } catch (err) {
            console.error("Error saving settings:", err);
        }
    };

    return (
        <div className="p-8 max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Property Settings</h1>
            <div className="space-y-4">
                <Input placeholder="Property Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <Input placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                <Input placeholder="Contact Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                <Textarea placeholder="Terms & Conditions" value={formData.terms} onChange={e => setFormData({ ...formData, terms: e.target.value })} />
                <Button onClick={saveSettings}>Save Branding</Button>
            </div>
        </div>
    );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
    component: Settings,
});

function Settings() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ 
        name: "", address: "", phone: "", terms: "", email: "", companyGst: "", totalRooms: 0 
    });
    
    const [inventory, setInventory] = useState<{type: string, roomNumbers: string}[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.id) return;
            try {
                const headers = await getAuthHeaders(getToken);
                const response = await fetch(`${API_URL}/settings`, { headers });

                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setFormData({
                            name: data.name || "",
                            address: data.address || "",
                            phone: data.phone || "",
                            email: data.email || "",
                            companyGst: data.companyGst || "",
                            terms: data.terms || "",
                            totalRooms: data.totalRooms || 0
                        });
                        if (data.inventory) {
                            setInventory(data.inventory);
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            }
        };
        fetchSettings();
    }, [user, getToken]);

    const handleInventoryChange = (index: number, field: string, value: string) => {
        const newInv = [...inventory];
        newInv[index] = { ...newInv[index], [field]: value };
        setInventory(newInv);
    };

    const addRoomType = () => {
        setInventory([...inventory, { type: "", roomNumbers: "" }]);
    };

    const removeRoomType = (index: number) => {
        setInventory(inventory.filter((_, i) => i !== index));
    };

    const saveSettings = async () => {
        try {
            const headers = await getAuthHeaders(getToken);
            const response = await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, inventory, userId: user?.id })
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
        <div className="p-8 max-w-4xl space-y-8">
            <h1 className="text-2xl font-bold">Property Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Branding & Details</h2>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Property Name</label>
                        <Input placeholder="Property Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                        <Input placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Contact Number</label>
                        <Input placeholder="Contact Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                        <Input placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Company GST Number</label>
                        <Input placeholder="Company GST Number" value={formData.companyGst} onChange={e => setFormData({ ...formData, companyGst: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Terms & Conditions</label>
                        <Textarea placeholder="Terms & Conditions" value={formData.terms} onChange={e => setFormData({ ...formData, terms: e.target.value })} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2 flex justify-between items-center">
                        Room Inventory
                        <Button type="button" variant="outline" size="sm" onClick={addRoomType}>
                            <Plus className="h-4 w-4 mr-1" /> Add Room Type
                        </Button>
                    </h2>
                    
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Total Number of Rooms (Property Capacity)</label>
                        <Input type="number" placeholder="Total Rooms" value={formData.totalRooms || ''} onChange={e => setFormData({ ...formData, totalRooms: Number(e.target.value) })} className="w-1/2" />
                    </div>

                    <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
                        {inventory.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">No rooms mapped yet. Click "Add Room Type" to categorize your rooms.</p>
                        )}
                        {inventory.map((inv, i) => (
                            <div key={i} className="flex gap-2 items-start bg-muted/20 p-3 rounded-lg border border-border/50">
                                <div className="flex-1 space-y-2">
                                    <Input placeholder="Room Type (e.g. Deluxe)" value={inv.type} onChange={e => handleInventoryChange(i, 'type', e.target.value)} className="font-medium" />
                                    <Textarea placeholder="Room Numbers (e.g. 101, 102, 103)" value={inv.roomNumbers} onChange={e => handleInventoryChange(i, 'roomNumbers', e.target.value)} className="min-h-[60px]" />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeRoomType(i)} className="text-destructive shrink-0 mt-1">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
                <Button size="lg" onClick={saveSettings}>Save All Settings</Button>
            </div>
        </div>
    );
}
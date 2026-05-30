import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";
import { Check, Search } from "lucide-react";

export function NewCustomerModal({ open, onOpenChange, onSaved, customerToEdit }: any) {
    const { getToken } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<string>("");
    
    const [formData, setFormData] = useState({
        name: "", phone: "", houseNo: "", street: "", city: "", state: "", pincode: "", country: "India"
    });

    useEffect(() => {
        if (open) {
            fetchBookings();
            if (customerToEdit) {
                setFormData({
                    name: customerToEdit.name || "",
                    phone: customerToEdit.phone || "",
                    houseNo: customerToEdit.houseNo || "",
                    street: customerToEdit.street || "",
                    city: customerToEdit.city || "",
                    state: customerToEdit.state || "",
                    pincode: customerToEdit.pincode || "",
                    country: customerToEdit.country || "India"
                });
                setSelectedBooking("");
            } else {
                setFormData({ name: "", phone: "", houseNo: "", street: "", city: "", state: "", pincode: "", country: "India" });
                setSelectedBooking("");
            }
        }
    }, [open, customerToEdit]);

    const fetchBookings = async () => {
        try {
            const headers = await getAuthHeaders(getToken);
            const res = await fetch(`${API_URL}/bookings`, { headers });
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImportBooking = (bookingId: string) => {
        setSelectedBooking(bookingId);
        if (!bookingId) return;
        const b = bookings.find(x => x._id === bookingId);
        if (b) {
            setFormData({
                ...formData,
                name: b.name || "",
                phone: b.phone || "",
                houseNo: b.houseNo || "",
                street: b.street || "",
                city: b.city || "",
                state: b.state || "",
                pincode: b.pincode || "",
                country: b.country || "India"
            });
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone) return alert("Name and Phone are required");
        
        try {
            const headers = await getAuthHeaders(getToken);
            const url = customerToEdit ? `${API_URL}/customers/${customerToEdit._id}` : `${API_URL}/customers`;
            const method = customerToEdit ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                onSaved();
                onOpenChange(false);
            }
        } catch (err) {
            console.error("Failed to save customer", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{customerToEdit ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                    <DialogDescription>
                        {customerToEdit ? "Update details for this customer." : "Manually add a customer or import details from a past booking."}
                    </DialogDescription>
                </DialogHeader>

                {!customerToEdit && (
                    <div className="bg-muted/40 p-4 rounded-lg border border-border/50 mb-4">
                        <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block flex items-center gap-2">
                            <Search className="h-3 w-3" /> Import from Booking (Optional)
                        </label>
                        <select 
                            value={selectedBooking} 
                            onChange={(e) => handleImportBooking(e.target.value)}
                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">-- Select a recent booking to auto-fill --</option>
                            {bookings.slice(0, 50).map(b => (
                                <option key={b._id} value={b._id}>
                                    {b.name} ({b.phone}) - {new Date(b.checkIn).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Name <span className="text-red-500">*</span></label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Phone <span className="text-red-500">*</span></label>
                            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">House No / Flat</label>
                        <Input value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Street / Area</label>
                        <Input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">City</label>
                            <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">State</label>
                            <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Pincode</label>
                            <Input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Country</label>
                            <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Check className="h-4 w-4 mr-2" /> {customerToEdit ? "Save Changes" : "Create Customer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

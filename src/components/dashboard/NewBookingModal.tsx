import { useState } from "react";
import { useAuth } from "@clerk/clerk-react"; // Import this
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function NewBookingModal({ onSave }: { onSave: () => void }) {
    const { getToken } = useAuth(); // Initialize hook
    const initialForm = {
        name: "", phone: "", roomNo: "", houseNo: "", street: "",
        landmark: "", city: "", state: "", pincode: "", country: "India",
        checkIn: "", checkOut: "", amount: ""
    };
    const [f, setF] = useState(initialForm);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Fetch the active session token
        const token = await getToken();

        const response = await fetch('http://localhost:5001/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Authorized request
            },
            body: JSON.stringify(f)
        });

        if (response.ok) {
            setF(initialForm);
            // Safe call to onSave
            if (typeof onSave === 'function') {
                onSave();
            }
        } else {
            console.error("Failed to save booking:", await response.text());
        }
    };

    return (
        <Dialog onOpenChange={(open) => !open && setF(initialForm)}>
            <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> New Booking</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                    <DialogDescription>Enter guest details below. Fields like street and landmark are optional.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-4">
                    <Input placeholder="Customer Name *" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
                    <Input placeholder="Mobile (e.g. +91 9999999999) *" required type="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
                    <Input placeholder="Room No *" required value={f.roomNo} onChange={e => setF({ ...f, roomNo: e.target.value })} />
                    <Input placeholder="House No" value={f.houseNo} onChange={e => setF({ ...f, houseNo: e.target.value })} />
                    <Input placeholder="Street" value={f.street} onChange={e => setF({ ...f, street: e.target.value })} />
                    <Input placeholder="Landmark" value={f.landmark} onChange={e => setF({ ...f, landmark: e.target.value })} />
                    <Input placeholder="City" value={f.city} onChange={e => setF({ ...f, city: e.target.value })} />
                    <Input placeholder="State" value={f.state} onChange={e => setF({ ...f, state: e.target.value })} />
                    <Input placeholder="Pincode" value={f.pincode} onChange={e => setF({ ...f, pincode: e.target.value })} />
                    <Input placeholder="Country" value={f.country} onChange={e => setF({ ...f, country: e.target.value })} />
                    <Input type="datetime-local" required value={f.checkIn} onChange={e => setF({ ...f, checkIn: e.target.value })} />
                    <Input type="datetime-local" required value={f.checkOut} onChange={e => setF({ ...f, checkOut: e.target.value })} />
                    <Input type="number" placeholder="Amount *" required className="col-span-2" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
                    <Button type="submit" className="col-span-2">Done & Generate Invoice</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
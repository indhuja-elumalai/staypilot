import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react"; 
import { API_URL, getAuthHeaders } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, AlertCircle } from "lucide-react";

export function NewBookingModal({ onSave, bookingToEdit, onOpenChange }: { onSave?: () => void, bookingToEdit?: any, onOpenChange?: (o: boolean) => void }) {
    const { getToken } = useAuth(); 
    
    const initialForm = {
        name: "", phone: "", email: "", houseNo: "", street: "",
        landmark: "", city: "", state: "", pincode: "", country: "India",
        checkIn: "", checkOut: ""
    };
    
    const [f, setF] = useState(initialForm);
    const [rooms, setRooms] = useState([{ roomNo: "", roomType: "", price: 0 }]);
    const [open, setOpen] = useState(false);
    const [inventory, setInventory] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [existingBookings, setExistingBookings] = useState<any[]>([]);
    
    const [matchCustomer, setMatchCustomer] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState("");

    // Load from localStorage on mount (only for new bookings)
    useEffect(() => {
        if (!bookingToEdit) {
            const savedForm = localStorage.getItem("draftBookingForm");
            const savedRooms = localStorage.getItem("draftBookingRooms");
            if (savedForm) setF(JSON.parse(savedForm));
            if (savedRooms) setRooms(JSON.parse(savedRooms));
        }
    }, [bookingToEdit]);

    // Save to localStorage when form or rooms change
    useEffect(() => {
        if (!bookingToEdit) {
            localStorage.setItem("draftBookingForm", JSON.stringify(f));
            localStorage.setItem("draftBookingRooms", JSON.stringify(rooms));
        }
    }, [f, rooms, bookingToEdit]);
    
    // When bookingToEdit is passed in, open modal and set form data
    useEffect(() => {
        if (bookingToEdit) {
            setOpen(true);
            setF({
                name: bookingToEdit.name || "",
                phone: bookingToEdit.phone || "",
                email: bookingToEdit.email || "",
                houseNo: bookingToEdit.houseNo || "",
                street: bookingToEdit.street || "",
                landmark: bookingToEdit.landmark || "",
                city: bookingToEdit.city || "",
                state: bookingToEdit.state || "",
                pincode: bookingToEdit.pincode || "",
                country: bookingToEdit.country || "India",
                checkIn: bookingToEdit.checkIn ? new Date(new Date(bookingToEdit.checkIn).getTime() - new Date(bookingToEdit.checkIn).getTimezoneOffset() * 60000).toISOString().slice(0,16) : "",
                checkOut: bookingToEdit.checkOut ? new Date(new Date(bookingToEdit.checkOut).getTime() - new Date(bookingToEdit.checkOut).getTimezoneOffset() * 60000).toISOString().slice(0,16) : ""
            });
            if (Array.isArray(bookingToEdit.rooms)) {
                setRooms(bookingToEdit.rooms);
            } else {
                setRooms([{ roomNo: bookingToEdit.roomNo || "", roomType: "Standard", price: bookingToEdit.amount || 0 }]);
            }
        }
    }, [bookingToEdit]);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const headers = await getAuthHeaders(getToken);
                    const [resInv, resCust, resBookings] = await Promise.all([
                        fetch(`${API_URL}/settings`, { headers }),
                        fetch(`${API_URL}/customers`, { headers }),
                        fetch(`${API_URL}/bookings`, { headers })
                    ]);
                    if (resInv.ok) {
                        const data = await resInv.json();
                        if (data.inventory) setInventory(data.inventory);
                    }
                    if (resCust.ok) setCustomers(await resCust.json());
                    if (resBookings.ok) setExistingBookings(await resBookings.json());
                } catch (e) {}
            };
            fetchData();
        }
    }, [open, getToken]);

    const handlePhoneChange = (val: string) => {
        const cleanVal = val.replace(/\D/g, '');
        setF({ ...f, phone: cleanVal });

        if (cleanVal.length === 10 && !bookingToEdit) {
            const foundCust = customers.find(c => c.phone === cleanVal);
            if (foundCust) {
                setMatchCustomer(foundCust);
            }
        }
    };

    const confirmAutoFill = () => {
        if (matchCustomer) {
            setF(prev => ({
                ...prev,
                name: matchCustomer.name || prev.name,
                email: matchCustomer.email || prev.email,
                houseNo: matchCustomer.houseNo || prev.houseNo,
                street: matchCustomer.street || prev.street,
                city: matchCustomer.city || prev.city,
                state: matchCustomer.state || prev.state,
                pincode: matchCustomer.pincode || prev.pincode,
                country: matchCustomer.country || prev.country
            }));
            setMatchCustomer(null);
        }
    };

    const nights = useMemo(() => {
        if (!f.checkIn || !f.checkOut) return 0;
        const start = new Date(f.checkIn).getTime();
        const end = new Date(f.checkOut).getTime();
        if (isNaN(start) || isNaN(end)) return 0;
        return Math.floor(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    }, [f.checkIn, f.checkOut]);

    const totalAmount = useMemo(() => {
        const roomSum = rooms.reduce((sum, room) => sum + (Number(room.price) || 0), 0);
        return roomSum * nights;
    }, [rooms, nights]);

    const handleRoomChange = (index: number, field: string, value: string | number) => {
        const newRooms = [...rooms];
        newRooms[index] = { ...newRooms[index], [field]: value };
        
        // Auto-fill room type based on comma-separated inventory
        if (field === 'roomNo' && typeof value === 'string') {
            const valClean = value.trim();
            const foundInv = inventory.find(inv => {
                if (!inv.roomNumbers) return false;
                const numbers = inv.roomNumbers.split(',').map((n: string) => n.trim());
                return numbers.includes(valClean);
            });
            if (foundInv && foundInv.type) {
                newRooms[index].roomType = foundInv.type;
            }
        }
        
        setRooms(newRooms);
    };

    const addRoom = () => {
        setRooms([...rooms, { roomNo: "", roomType: "", price: 0 }]);
    };

    const removeRoom = (index: number) => {
        if (rooms.length > 1) {
            setRooms(rooms.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        // Double Booking Check
        const newStart = new Date(f.checkIn).getTime();
        const newEnd = new Date(f.checkOut).getTime();
        
        for (const r of rooms) {
            const roomNo = r.roomNo.trim();
            const conflict = existingBookings.find(b => {
                if (bookingToEdit && b._id === bookingToEdit._id) return false;
                if (b.actualCheckOutTime) return false; // Already checked out early
                const bStart = new Date(b.checkIn).getTime();
                const bEnd = new Date(b.checkOut).getTime();
                
                let bRooms = [];
                if (Array.isArray(b.rooms)) bRooms = b.rooms.map((br: any) => br.roomNo.trim());
                else if (b.roomNo) bRooms = b.roomNo.split(',').map((n: string) => n.trim());
                
                if (bRooms.includes(roomNo)) {
                    // Check overlap
                    if (newStart < bEnd && newEnd > bStart) return true;
                }
                return false;
            });

            if (conflict) {
                setErrorMsg(`Room ${roomNo} is already booked from ${new Date(conflict.checkIn).toLocaleDateString()} to ${new Date(conflict.checkOut).toLocaleDateString()}`);
                return;
            }
        }

        const token = await getToken();
        
        // Backward compatibility: keep roomNo and amount on the root level based on the first room,
        // but also send the full rooms array
        const bookingData = {
            ...f,
            amount: totalAmount,
            roomNo: rooms.map(r => r.roomNo).join(", "),
            rooms: rooms
        };

        const url = bookingToEdit ? `http://localhost:5001/api/bookings/${bookingToEdit._id}` : 'http://localhost:5001/api/bookings';
        const method = bookingToEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            setF(initialForm);
            setRooms([{ roomNo: "", roomType: "", price: 0 }]);
            localStorage.removeItem("draftBookingForm");
            localStorage.removeItem("draftBookingRooms");
            
            setOpen(false); // Close modal
            if (onOpenChange) onOpenChange(false);
            if (typeof onSave === 'function') {
                onSave();
            }
        } else {
            console.error("Failed to save booking:", await response.text());
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(o) => { 
                setOpen(o); 
            if(onOpenChange) onOpenChange(o);
            if(!o) {
                setF(initialForm);
                setRooms([{ roomNo: "", roomType: "", price: 0 }]);
            }
        }}>
            <DialogTrigger asChild>
                {!bookingToEdit && <Button><Plus className="h-4 w-4 mr-2" /> New Booking</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{bookingToEdit ? "Edit Booking" : "Create New Booking"}</DialogTitle>
                    <DialogDescription>Enter guest details below. Address, State and 10-digit Phone are mandatory.</DialogDescription>
                </DialogHeader>
                
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" /> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-2">
                    <Input placeholder="Customer Name *" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
                    <Input 
                        placeholder="Mobile (10 digits) *" 
                        required 
                        type="tel" 
                        pattern="[0-9]{10}"
                        maxLength={10}
                        title="Please enter exactly 10 digits"
                        value={f.phone} 
                        onChange={e => handlePhoneChange(e.target.value)} 
                    />
                    <Input placeholder="Email Address (Optional)" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="col-span-2" />
                    
                    <div className="col-span-2 space-y-3 p-4 bg-muted/30 border border-border rounded-lg mt-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">Room Details</h4>
                            <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                                <Plus className="h-4 w-4 mr-1" /> Add Room
                            </Button>
                        </div>
                        {rooms.map((room, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <Input placeholder="Room No *" required value={room.roomNo} onChange={e => handleRoomChange(i, 'roomNo', e.target.value)} className="flex-1" />
                                <Input placeholder="Type (e.g. Deluxe) *" required value={room.roomType} onChange={e => handleRoomChange(i, 'roomType', e.target.value)} className="flex-1" />
                                <Input placeholder="Price *" type="number" required value={room.price || ''} onChange={e => handleRoomChange(i, 'price', Number(e.target.value))} className="w-28" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeRoom(i)} disabled={rooms.length === 1} className="shrink-0 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <div className="text-right pt-2 border-t border-border mt-2 text-sm">
                            <span className="text-muted-foreground mr-4">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                            <span className="font-semibold text-muted-foreground mr-2">Total Amount:</span>
                            <span className="text-lg font-bold text-primary">₹{totalAmount}</span>
                        </div>
                    </div>
                    
                    <Input placeholder="House No *" required value={f.houseNo} onChange={e => setF({ ...f, houseNo: e.target.value })} />
                    <Input placeholder="Street *" required value={f.street} onChange={e => setF({ ...f, street: e.target.value })} />
                    <Input placeholder="City *" required value={f.city} onChange={e => setF({ ...f, city: e.target.value })} />
                    <Input placeholder="State *" required value={f.state} onChange={e => setF({ ...f, state: e.target.value })} />
                    
                    <Input placeholder="Landmark" value={f.landmark} onChange={e => setF({ ...f, landmark: e.target.value })} />
                    <Input placeholder="Pincode" value={f.pincode} onChange={e => setF({ ...f, pincode: e.target.value })} />
                    <Input placeholder="Country" value={f.country} onChange={e => setF({ ...f, country: e.target.value })} className="col-span-2" />
                    
                    <Input type="datetime-local" required value={f.checkIn} onChange={e => setF({ ...f, checkIn: e.target.value })} />
                    <Input type="datetime-local" required value={f.checkOut} onChange={e => setF({ ...f, checkOut: e.target.value })} />
                    
                    <Button type="submit" className="col-span-2 mt-4">Save & Continue</Button>
                </form>
            </DialogContent>
        </Dialog>

        {/* Customer Match Dialog */}
        <Dialog open={!!matchCustomer} onOpenChange={() => setMatchCustomer(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Existing Customer Found</DialogTitle>
                    <DialogDescription>
                        A customer with this phone number already exists in your CRM.
                    </DialogDescription>
                </DialogHeader>
                {matchCustomer && (
                    <div className="bg-muted p-4 rounded-lg text-sm">
                        <p className="font-semibold text-base">{matchCustomer.name}</p>
                        <p className="text-muted-foreground">{matchCustomer.email || "No Email"}</p>
                        <p className="text-muted-foreground mt-2">{matchCustomer.city || "No City"}, {matchCustomer.state || "No State"}</p>
                    </div>
                )}
                <DialogFooter className="sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setMatchCustomer(null)}>
                        Skip
                    </Button>
                    <Button type="button" onClick={confirmAutoFill}>
                        Auto-Fill Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
    );
}
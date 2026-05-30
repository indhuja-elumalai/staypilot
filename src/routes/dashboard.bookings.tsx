import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { NewBookingModal } from "@/components/dashboard/NewBookingModal";
import { DigitalInvoiceModal } from "@/components/dashboard/DigitalInvoiceModal";
import { EditableInvoiceModal } from "@/components/dashboard/EditableInvoiceModal";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { Printer, Receipt, Home, DollarSign, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/bookings")({
  head: () => ({ meta: [{ title: "Bookings · StayPilot" }] }),
  component: Bookings,
});

function Bookings() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [digitalInvoiceBooking, setDigitalInvoiceBooking] = useState<any>(null);
  const [editableInvoiceBooking, setEditableInvoiceBooking] = useState<any>(null);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const getStatus = (b: any) => {
    if (b.actualCheckOutTime) return <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded">Checked Out</span>;
    const now = new Date();
    const start = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    if (now > end) return <span className="text-amber-600 font-bold bg-amber-100 px-2 py-1 rounded shadow-sm border border-amber-200">Time Up</span>;
    if (now >= start) return <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">Checked In</span>;
    return <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">Upcoming</span>;
  };

  const isTimeUp = (b: any) => {
      if (b.actualCheckOutTime) return false;
      const now = new Date();
      const end = new Date(b.checkOut);
      return now > end;
  };

  const calculateNights = (inDate: string, outDate: string) =>
    Math.floor(Math.abs(new Date(outDate).getTime() - new Date(inDate).getTime()) / (1000 * 60 * 60 * 24));

  const fetchBookingsAndSettings = async () => {
    try {
      const headers = await getAuthHeaders(getToken);
      const [bookingsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/bookings`, { headers }),
        fetch(`${API_URL}/settings`, { headers })
      ]);
      setBookings(await bookingsRes.json());
      setSettings(await settingsRes.json());
    } catch (err) { console.error("Error fetching:", err); }
  };

  useEffect(() => { fetchBookingsAndSettings(); }, []);

  const handleDeleteBooking = async (id: string) => {
      if (!confirm("Are you sure you want to delete this booking?")) return;
      try {
          const headers = await getAuthHeaders(getToken);
          await fetch(`${API_URL}/bookings/${id}`, { method: "DELETE", headers });
          fetchBookingsAndSettings();
      } catch (err) {
          console.error("Error deleting booking:", err);
      }
  };

  const handleManualCheckOut = async (id: string) => {
      try {
          const headers = await getAuthHeaders(getToken);
          await fetch(`${API_URL}/bookings/${id}`, { 
              method: "PUT", 
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({ actualCheckOutTime: new Date().toISOString() })
          });
          fetchBookingsAndSettings();
      } catch (err) { console.error("Error checking out:", err); }
  };

  const todayStr = new Date().toDateString();
  const todaysBookings = bookings.filter(b => {
      if (b.actualCheckOutTime) return false;
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      const today = new Date();
      return today >= start && today <= end;
  });
  
  const totalRevenueToday = todaysBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  
  // Calculate booked room numbers for today
  const bookedRoomNos = new Set<string>();
  todaysBookings.forEach(b => {
      if (Array.isArray(b.rooms)) {
          b.rooms.forEach((r: any) => bookedRoomNos.add(r.roomNo.toString().trim()));
      } else if (b.roomNo) {
          b.roomNo.toString().split(',').forEach((r: string) => bookedRoomNos.add(r.trim()));
      }
  });

  const inventory = settings?.inventory || [];
  const totalRoomsProperty = settings?.totalRooms || 0;
  
  // Calculate availability per type
  const availabilityByType = inventory.map((inv: any) => {
      const allRooms = inv.roomNumbers ? inv.roomNumbers.split(',').map((r: string) => r.trim()).filter(Boolean) : [];
      const availableRooms = allRooms.filter((r: string) => !bookedRoomNos.has(r));
      return {
          type: inv.type,
          available: availableRooms,
          total: allRooms.length
      };
  }).filter((a: any) => a.type); // only valid types

  const totalAvailableRoomsCount = availabilityByType.reduce((sum: number, a: any) => sum + a.available.length, 0);

  return (
    <>
      <Topbar title="Bookings" action={<NewBookingModal onSave={fetchBookingsAndSettings} bookingToEdit={editingBooking} onOpenChange={(open: boolean) => !open && setEditingBooking(null)} />} />

      {/* Graphics Section */}
      <div className="px-8 pt-6 space-y-4">
        {/* Top row: Active Bookings and Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border p-6 rounded-xl flex items-center gap-4 shadow-sm h-full">
            <div className="p-3 bg-primary/10 rounded-lg"><Home className="text-primary" /></div>
            <div><p className="text-muted-foreground text-sm">Active Bookings</p><h2 className="text-2xl font-bold">{todaysBookings.length}</h2></div>
            </div>
            <div className="bg-card border p-6 rounded-xl flex items-center gap-4 shadow-sm h-full">
            <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="text-green-600" /></div>
            <div><p className="text-muted-foreground text-sm">Revenue Active</p><h2 className="text-2xl font-bold">₹{totalRevenueToday}</h2></div>
            </div>
        </div>
        
        {/* Next row: Rooms Available */}
        <div className="bg-card border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-md"><Home className="h-4 w-4 text-blue-600" /></div>
            <div>
              <p className="font-semibold">Rooms Available</p>
              <p className="text-xs text-muted-foreground">{totalAvailableRoomsCount} out of {totalRoomsProperty || 'Total'} available</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {availabilityByType.length === 0 && <p className="text-xs text-muted-foreground">No inventory setup yet.</p>}
            {availabilityByType.map((a: any, i: number) => (
                <div key={i} className="border-b border-border/50 pb-2 last:border-0">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{a.type}</span>
                        <span className="text-muted-foreground">{a.available.length}/{a.total}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {a.available.length === 0 ? (
                            <span className="text-xs text-rose-500 bg-rose-50 px-1.5 rounded">Sold Out</span>
                        ) : (
                            a.available.map((r: string) => (
                                <span key={r} className="text-xs bg-muted text-muted-foreground px-1.5 rounded border border-border/50">{r}</span>
                            ))
                        )}
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-4">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>{["S.No", "Name", "Rooms", "In", "Out", "Nights", "Amount", "Status", "Actions"].map(h => <th key={h} className="text-left p-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {bookings.map((b: any, i: number) => {
                const roomCount = Array.isArray(b.rooms) ? b.rooms.length : 1;
                const roomNos = Array.isArray(b.rooms) ? b.rooms.map((r: any) => r.roomNo).join(", ") : b.roomNo;
                const nights = calculateNights(b.checkIn, b.checkOut);
                const roomPriceSum = Array.isArray(b.rooms) 
                    ? b.rooms.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0)
                    : Number(b.amount || 0);
                const finalAmount = b.rooms ? roomPriceSum * nights : b.amount;
                
                return (
                <tr key={b._id} className="border-t hover:bg-muted/20 group">
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4 font-medium">{b.name}</td>
                  <td className="p-4 text-muted-foreground">
                    <span className="font-medium text-foreground">{roomCount}</span> Room{roomCount > 1 ? 's' : ''}: <span className="text-xs">{roomNos}</span>
                  </td>
                  <td className="p-4">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td className="p-4">{nights}</td>
                  <td className="p-4 font-bold text-primary">₹{finalAmount}</td>
                  <td className="p-4">{getStatus(b)}</td>
                  <td className="p-4 flex gap-1 items-center">
                    {isTimeUp(b) && (
                        <div className="flex gap-1 mr-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => handleManualCheckOut(b._id)}>
                                Check Out
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setEditingBooking(b)}>
                                Extend
                            </Button>
                        </div>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setEditingBooking(b)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBooking(b._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDigitalInvoiceBooking(b)}>
                      <Receipt className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditableInvoiceBooking(b)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <DigitalInvoiceModal 
        booking={digitalInvoiceBooking} 
        open={!!digitalInvoiceBooking} 
        onOpenChange={(o) => !o && setDigitalInvoiceBooking(null)} 
      />
      
      <EditableInvoiceModal 
        booking={editableInvoiceBooking} 
        open={!!editableInvoiceBooking} 
        onOpenChange={(o) => !o && setEditableInvoiceBooking(null)} 
      />


    </>
  );
}
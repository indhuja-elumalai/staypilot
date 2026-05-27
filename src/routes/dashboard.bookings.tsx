import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { NewBookingModal } from "@/components/dashboard/NewBookingModal";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { Printer, Receipt, Home, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/bookings")({
  head: () => ({ meta: [{ title: "Bookings · StayPilot" }] }),
  component: Bookings,
});

function Bookings() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const getStatus = (inDate: string, outDate: string) => {
    const now = new Date();
    const start = new Date(inDate);
    const end = new Date(outDate);
    if (now >= start && now <= end) return <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">Checked In</span>;
    if (now > end) return <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded">Checked Out</span>;
    return <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">Upcoming</span>;
  };

  const calculateNights = (inDate: string, outDate: string) =>
    Math.ceil(Math.abs(new Date(outDate).getTime() - new Date(inDate).getTime()) / (1000 * 60 * 60 * 24));

  const fetchBookings = async () => {
    try {
      const headers = await getAuthHeaders(getToken);
      const res = await fetch(`${API_URL}/bookings`, { headers });
      const data = await res.json();
      setBookings(data);
    } catch (err) { console.error("Error fetching:", err); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const todayStr = new Date().toDateString();
  const todaysBookings = bookings.filter(b => new Date(b.checkIn).toDateString() === todayStr);
  const totalRevenueToday = todaysBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const handlePrint = (booking: any) => {
    setSelectedBooking(booking);
    setTimeout(() => window.print(), 300);
  };

  return (
    <>
      <Topbar title="Bookings" action={<NewBookingModal onSave={fetchBookings} />} />

      {/* Graphics Section */}
      <div className="grid grid-cols-2 gap-4 px-8 pt-6">
        <div className="bg-card border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-primary/10 rounded-lg"><Home className="text-primary" /></div>
          <div><p className="text-muted-foreground text-sm">Bookings Today</p><h2 className="text-2xl font-bold">{todaysBookings.length}</h2></div>
        </div>
        <div className="bg-card border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="text-green-600" /></div>
          <div><p className="text-muted-foreground text-sm">Revenue Today</p><h2 className="text-2xl font-bold">₹{totalRevenueToday}</h2></div>
        </div>
      </div>

      <div className="p-8">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>{["S.No", "Name", "Room", "In", "Out", "Nights", "Amount", "Status", "Actions"].map(h => <th key={h} className="text-left p-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {bookings.map((b: any, i: number) => (
                <tr key={b._id} className="border-t hover:bg-muted/20">
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4 font-medium">{b.name}</td>
                  <td className="p-4">{b.roomNo}</td>
                  <td className="p-4">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td className="p-4">{calculateNights(b.checkIn, b.checkOut)}</td>
                  <td className="p-4 font-bold text-primary">₹{b.amount}</td>
                  <td className="p-4">{getStatus(b.checkIn, b.checkOut)}</td>
                  <td className="p-4 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Receipt className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrint(b)}><Printer className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Template (Only visible when printing) */}
      {selectedBooking && (
        <div className="hidden print:block p-12 bg-white text-black">
          <h1 className="text-4xl font-bold mb-4">INVOICE</h1>
          <div className="space-y-2 border-t pt-4">
            <p><strong>Guest Name:</strong> {selectedBooking.name}</p>
            <p><strong>Room Number:</strong> {selectedBooking.roomNo}</p>
            <p><strong>Check-In:</strong> {new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
            <p><strong>Check-Out:</strong> {new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
            <p className="text-xl font-bold mt-4">Total Amount: ₹{selectedBooking.amount}</p>
          </div>
        </div>
      )}

      {/* CSS Logic to ensure only the invoice shows during print */}
      <style>{`
        @media print {
          body > *:not(div:has(.print\\:block)) { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </>
  );
}
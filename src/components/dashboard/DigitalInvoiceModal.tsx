import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { API_URL, getAuthHeaders } from "@/lib/api";

export function DigitalInvoiceModal({ booking, open, onOpenChange }: { booking: any, open: boolean, onOpenChange: (o: boolean) => void }) {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const headers = await getAuthHeaders(getToken);
                const res = await fetch(`${API_URL}/settings`, { headers });
                if (res.ok) {
                    setSettings(await res.json());
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };
        if (open) loadSettings();
    }, [open, getToken]);

    if (!booking) return null;

    const propName = settings?.name || "StayPilot Pro";
    const propAddress = settings?.address || "123 Hospitality Ave, Suite 100";
    const propPhone = settings?.phone || "";
    const propEmail = settings?.email || "contact@staypilot.com";
    const propGST = settings?.companyGst || "";
    const invoiceId = `INV-${booking._id?.substring(booking._id.length - 6).toUpperCase()}`;

    // Normalize rooms (backward compatibility for old bookings)
    const rooms = Array.isArray(booking.rooms) 
        ? booking.rooms 
        : [{ roomNo: booking.roomNo, roomType: "Standard", price: booking.amount }];

    const nights = Math.floor(Math.abs(new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    
    // For old bookings without rooms array, the amount is already the final amount
    const finalAmount = Array.isArray(booking.rooms) 
        ? rooms.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0) * nights
        : booking.amount;

    const handleDownloadPDF = () => {
        const content = document.getElementById('printable-digital-invoice');
        if (!content) return;
        
        const printDiv = document.createElement('div');
        printDiv.id = 'print-mount';
        printDiv.innerHTML = content.innerHTML;
        
        const style = document.createElement('style');
        style.id = 'print-style';
        style.innerHTML = `
            @media print {
                body > *:not(#print-mount) { display: none !important; }
                #print-mount { display: block !important; position: absolute; top: 0; left: 0; width: 100%; background: white; padding: 0; margin: 0; }
                @page { margin: 0; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(printDiv);
        
        window.print();
        
        document.body.removeChild(printDiv);
        document.head.removeChild(style);
    };

    const handleShare = async () => {
        const text = `Invoice ${invoiceId} for ${booking.name} at ${propName}. Total: ₹${booking.amount}.`;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Invoice ${invoiceId}`,
                    text: text,
                    url: window.location.href, 
                });
            } else {
                await navigator.clipboard.writeText(text);
                alert("Invoice summary copied to clipboard! (Your browser doesn't support the native Share drawer)");
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Error sharing", err);
                navigator.clipboard.writeText(text).then(() => alert("Invoice details copied to clipboard!"));
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-[#FDFBD4] border-none text-[#38240D] max-h-[90vh] overflow-y-auto">
                <div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-[#39542C]">Digital Invoice</DialogTitle>
                        <DialogDescription className="text-[#38240D]/70">
                            Shareable receipt for {booking.name}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="bg-white rounded-xl p-8 shadow-sm border border-[#39542C]/10 mt-4 w-full max-w-full relative">
                    <div className="flex justify-between items-start border-b border-[#39542C]/10 pb-6 mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-[#39542C] tracking-tight">{propName}</h2>
                            <p className="text-sm text-[#38240D]/70 mt-1 whitespace-pre-line">{propAddress}</p>
                            {propPhone && <p className="text-sm text-[#38240D]/70">{propPhone}</p>}
                            <p className="text-sm text-[#38240D]/70">{propEmail}</p>
                            {propGST && <p className="text-xs text-[#38240D]/50 mt-1">GSTIN: {propGST}</p>}
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-semibold text-[#38240D]">RECEIPT</h3>
                            <p className="text-sm font-bold text-[#39542C]">#{invoiceId}</p>
                            <p className="text-sm text-[#38240D]/70 mt-1">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs font-semibold text-[#39542C] uppercase tracking-wider mb-2">Billed To</p>
                            <p className="font-medium text-lg">{booking.name}</p>
                            <p className="text-sm">{booking.phone}</p>
                            <div className="text-sm mt-1">
                                {booking.houseNo || booking.street ? <p>{[booking.houseNo, booking.street].filter(Boolean).join(", ")}</p> : null}
                                {booking.city || booking.state || booking.pincode ? <p>{[booking.city, booking.state, booking.pincode].filter(Boolean).join(", ")}</p> : null}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-[#39542C] uppercase tracking-wider mb-2">Stay Overview</p>
                            <p className="text-sm"><span className="font-medium text-[#38240D]/70">In:</span> {new Date(booking.checkIn).toLocaleDateString()}</p>
                            <p className="text-sm mt-1"><span className="font-medium text-[#38240D]/70">Out:</span> {new Date(booking.checkOut).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[#39542C] uppercase border-b border-[#39542C]/20">
                                <tr>
                                    <th className="pb-2">Room</th>
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2 text-center">Nights</th>
                                    <th className="pb-2 text-right">Price</th>
                                    <th className="pb-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#39542C]/10">
                                {rooms.map((r: any, i: number) => {
                                    const roomTotal = Array.isArray(booking.rooms) ? (r.price || 0) * nights : r.price || 0;
                                    return (
                                        <tr key={i}>
                                            <td className="py-3">{r.roomNo || "-"}</td>
                                            <td className="py-3 text-[#38240D]/70">{r.roomType || "-"}</td>
                                            <td className="py-3 text-center">{nights}</td>
                                            <td className="py-3 text-right">₹{r.price || 0}</td>
                                            <td className="py-3 text-right font-medium">₹{roomTotal}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-[#FDFBD4]/50 rounded-lg p-6 flex justify-between items-center border border-[#39542C]/10">
                        <span className="text-lg font-semibold text-[#39542C]">Total Amount</span>
                        <span className="text-3xl font-bold text-[#38240D]">₹{finalAmount}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button onClick={handleShare} variant="outline" className="border-[#39542C]/20 text-[#39542C] hover:bg-[#39542C]/10">
                        <Share2 className="h-4 w-4 mr-2" /> Share Link
                    </Button>
                    <Button onClick={handleDownloadPDF} className="bg-[#39542C] hover:bg-[#39542C]/90 text-white">
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                </div>

                {/* HIDDEN TEMPLATE FOR PRINTING */}
                <div id="printable-digital-invoice" className="hidden">
                    <div style={{ backgroundColor: 'white', padding: '3rem', width: '800px', maxWidth: '100%', margin: '0 auto', fontFamily: 'sans-serif', color: '#38240D' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(57, 84, 44, 0.2)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#39542C', margin: 0 }}>{propName}</h2>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(56, 36, 13, 0.7)', marginTop: '0.25rem', whiteSpace: 'pre-line' }}>{propAddress}</p>
                                {propPhone && <p style={{ fontSize: '0.875rem', color: 'rgba(56, 36, 13, 0.7)' }}>{propPhone}</p>}
                                <p style={{ fontSize: '0.875rem', color: 'rgba(56, 36, 13, 0.7)' }}>{propEmail}</p>
                                {propGST && <p style={{ fontSize: '0.75rem', color: 'rgba(56, 36, 13, 0.5)', marginTop: '0.25rem' }}>GSTIN: {propGST}</p>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>RECEIPT</h3>
                                <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#39542C' }}>#{invoiceId}</p>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(56, 36, 13, 0.7)', marginTop: '0.25rem' }}>{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#39542C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Billed To</p>
                                <p style={{ fontWeight: 500, fontSize: '1.125rem', margin: 0 }}>{booking.name}</p>
                                <p style={{ fontSize: '0.875rem', margin: 0 }}>{booking.phone}</p>
                                <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    {booking.houseNo || booking.street ? <p style={{ margin: 0 }}>{[booking.houseNo, booking.street].filter(Boolean).join(", ")}</p> : null}
                                    {booking.city || booking.state || booking.pincode ? <p style={{ margin: 0 }}>{[booking.city, booking.state, booking.pincode].filter(Boolean).join(", ")}</p> : null}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#39542C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Stay Overview</p>
                                <p style={{ fontSize: '0.875rem', margin: 0 }}><span style={{ fontWeight: 500, color: 'rgba(56, 36, 13, 0.7)' }}>In:</span> {new Date(booking.checkIn).toLocaleDateString()}</p>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}><span style={{ fontWeight: 500, color: 'rgba(56, 36, 13, 0.7)' }}>Out:</span> {new Date(booking.checkOut).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <table style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead style={{ fontSize: '0.75rem', color: '#39542C', textTransform: 'uppercase', borderBottom: '1px solid rgba(57, 84, 44, 0.2)' }}>
                                    <tr>
                                        <th style={{ paddingBottom: '0.5rem' }}>Room</th>
                                        <th style={{ paddingBottom: '0.5rem' }}>Type</th>
                                        <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>Nights</th>
                                        <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Price</th>
                                        <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody style={{ borderTop: '1px solid rgba(57, 84, 44, 0.1)' }}>
                                    {rooms.map((r: any, i: number) => {
                                        const roomTotal = Array.isArray(booking.rooms) ? (r.price || 0) * nights : r.price || 0;
                                        return (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(57, 84, 44, 0.1)' }}>
                                                <td style={{ padding: '0.75rem 0' }}>{r.roomNo || "-"}</td>
                                                <td style={{ padding: '0.75rem 0', color: 'rgba(56, 36, 13, 0.7)' }}>{r.roomType || "-"}</td>
                                                <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>{nights}</td>
                                                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>₹{r.price || 0}</td>
                                                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 500 }}>₹{roomTotal}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '0.5rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(57, 84, 44, 0.1)' }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#39542C' }}>Total Amount</span>
                            <span style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>₹{finalAmount}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

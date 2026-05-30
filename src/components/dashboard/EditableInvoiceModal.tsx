import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { API_URL, getAuthHeaders } from "@/lib/api";

export function EditableInvoiceModal({ booking, open, onOpenChange }: { booking: any, open: boolean, onOpenChange: (o: boolean) => void }) {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<any>(null);
    const [edited, setEdited] = useState<any>(null);

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
        if (open) {
            loadSettings();
            const nights = booking.checkOut && booking.checkIn ? Math.floor(Math.abs(new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1;
            const roomsArray = Array.isArray(booking.rooms) ? [...booking.rooms] : [{ roomNo: booking.roomNo, roomType: "Standard", price: booking.amount }];
            
            const initialAmount = booking.amountForCustomer !== undefined ? booking.amountForCustomer : (Array.isArray(booking.rooms)
                ? roomsArray.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0) * nights
                : booking.amount);

            setEdited({ 
                ...booking, 
                rooms: roomsArray,
                nights: nights,
                amount: initialAmount
            });
        }
    }, [booking, open, getToken]);

    if (!booking || !edited) return null;

    const propName = settings?.name || "StayPilot Pro";
    const propAddress = settings?.address || "123 Hospitality Ave, Suite 100";
    const propPhone = settings?.phone || "";
    const propEmail = settings?.email || "contact@staypilot.com";
    const propGST = settings?.companyGst || "";
    const invoiceId = `INV-${booking._id?.substring(booking._id.length - 6).toUpperCase()}`;

    const handlePrint = () => {
        const content = document.getElementById('printable-invoice-template');
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

    const InputLine = ({ value, onChange, className = "", type = "text", placeholder = "" }: any) => (
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`bg-transparent border-b border-transparent hover:border-black/20 focus:border-black/40 outline-none print:border-none ${className}`}
        />
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <DialogTitle>Print Preview & Edit</DialogTitle>
                        <DialogDescription>Click on any text in the invoice below to edit before printing.</DialogDescription>
                    </div>
                    <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                        <Printer className="h-4 w-4 mr-2" /> Print Invoice
                    </Button>
                </div>

                <div className="bg-white text-black p-8 md:p-12 shadow-sm border rounded-lg w-full max-w-full overflow-hidden relative">
                    <h1 className="text-4xl font-bold mb-8 uppercase tracking-widest text-center border-b-2 pb-6 border-black/10">Tax Invoice</h1>
                    
                    <div className="flex justify-between mb-12">
                        <div>
                            <h2 className="text-xl font-bold">{propName}</h2>
                            <p className="text-gray-600 mt-1 whitespace-pre-line">{propAddress}</p>
                            {propPhone && <p className="text-gray-600">{propPhone}</p>}
                            <p className="text-gray-600">{propEmail}</p>
                            {propGST && <p className="text-sm font-medium mt-1">GSTIN: {propGST}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">Invoice #{invoiceId}</p>
                            <p className="text-gray-600 mt-1">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="border border-black/20 rounded-lg overflow-hidden">
                        <div className="bg-black/5 p-4 grid grid-cols-2 border-b border-black/20">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Billed To</p>
                                <InputLine value={edited.name} onChange={(v: string) => setEdited({...edited, name: v})} className="font-bold text-lg w-full" />
                                <InputLine value={edited.phone} onChange={(v: string) => setEdited({...edited, phone: v})} className="w-full text-sm block mt-1" />
                                <div className="text-sm mt-1 w-full flex flex-col gap-1">
                                    <InputLine value={edited.houseNo || ''} onChange={(v: string) => setEdited({...edited, houseNo: v})} className="w-full placeholder:text-gray-300" placeholder="House No/Street" />
                                    <InputLine value={edited.city || ''} onChange={(v: string) => setEdited({...edited, city: v})} className="w-full placeholder:text-gray-300" placeholder="City" />
                                    <InputLine value={edited.state || ''} onChange={(v: string) => setEdited({...edited, state: v})} className="w-full placeholder:text-gray-300" placeholder="State & Pincode" />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Stay Details</p>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <span className="font-medium text-sm">Check-In:</span>
                                    <InputLine type="datetime-local" value={edited.checkIn || ''} onChange={(v: string) => setEdited({...edited, checkIn: v})} className="text-sm w-40" />
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <span className="font-medium text-sm">Check-Out:</span>
                                    <InputLine type="datetime-local" value={edited.checkOut || ''} onChange={(v: string) => setEdited({...edited, checkOut: v})} className="text-sm w-40" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <table className="w-full text-sm text-left mb-4">
                                <thead className="text-xs text-gray-500 uppercase border-b border-black/10">
                                    <tr>
                                        <th className="pb-2 font-bold w-1/4">Room</th>
                                        <th className="pb-2 font-bold w-1/4">Type</th>
                                        <th className="pb-2 font-bold text-center w-1/6">Nights</th>
                                        <th className="pb-2 font-bold text-right w-1/6">Price</th>
                                        <th className="pb-2 font-bold text-right w-1/6">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {edited.rooms.map((r: any, i: number) => (
                                        <tr key={i}>
                                            <td className="py-2">
                                                <InputLine value={r.roomNo || ''} onChange={(v: string) => {
                                                    const newRooms = [...edited.rooms]; newRooms[i].roomNo = v; setEdited({...edited, rooms: newRooms});
                                                }} className="w-full" />
                                            </td>
                                            <td className="py-2">
                                                <InputLine value={r.roomType || ''} onChange={(v: string) => {
                                                    const newRooms = [...edited.rooms]; newRooms[i].roomType = v; setEdited({...edited, rooms: newRooms});
                                                }} className="w-full" />
                                            </td>
                                            <td className="py-2 text-center">
                                                <InputLine type="number" value={edited.nights || 1} onChange={(v: string) => {
                                                    setEdited({...edited, nights: Number(v)});
                                                }} className="w-12 text-center" />
                                            </td>
                                            <td className="py-2 text-right">
                                                <div className="flex items-center justify-end">
                                                    <span>₹</span>
                                                    <InputLine type="number" value={r.price || ''} onChange={(v: string) => {
                                                        const newRooms = [...edited.rooms]; newRooms[i].price = Number(v); setEdited({...edited, rooms: newRooms});
                                                    }} className="w-20 text-right ml-1" />
                                                </div>
                                            </td>
                                            <td className="py-2 text-right font-medium">
                                                ₹{(r.price || 0) * (edited.nights || 1)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="p-4 flex justify-between items-center bg-black/5 border-t border-black/20">
                            <span className="text-xl font-bold">Total Amount Due</span>
                            <div className="flex items-center font-black text-3xl">
                                <span>₹</span>
                                <InputLine type="number" value={edited.amount} onChange={(v: string) => setEdited({...edited, amount: v})} className="w-32 ml-1 text-right" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-gray-500 text-sm">
                        <p>Thank you for choosing {propName}!</p>
                        <p className="mt-1">Terms & Conditions apply. This is a computer-generated invoice.</p>
                    </div>
                </div>

                {/* HIDDEN READ-ONLY TEMPLATE FOR PRINTING (Ensures inputs become static text) */}
                <div id="printable-invoice-template" className="hidden">
                    <div className="bg-white text-black p-12 w-[800px] max-w-full mx-auto" style={{ fontFamily: 'sans-serif' }}>
                        <h1 className="text-4xl font-bold mb-8 uppercase tracking-widest text-center border-b-2 pb-6 border-black/10" style={{ borderBottomWidth: '2px', borderColor: 'rgba(0,0,0,0.1)', paddingBottom: '1.5rem', marginBottom: '2rem', fontSize: '2.25rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tax Invoice</h1>
                        
                        <div className="flex justify-between mb-12" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                            <div>
                                <h2 className="text-xl font-bold" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{propName}</h2>
                                <p className="text-gray-600 mt-1 whitespace-pre-line" style={{ color: '#4b5563', marginTop: '0.25rem', whiteSpace: 'pre-line' }}>{propAddress}</p>
                                {propPhone && <p className="text-gray-600" style={{ color: '#4b5563' }}>{propPhone}</p>}
                                <p className="text-gray-600" style={{ color: '#4b5563' }}>{propEmail}</p>
                                {propGST && <p className="text-sm font-medium mt-1" style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem' }}>GSTIN: {propGST}</p>}
                            </div>
                            <div className="text-right" style={{ textAlign: 'right' }}>
                                <p className="text-xl font-bold" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Invoice #{invoiceId}</p>
                                <p className="text-gray-600 mt-1" style={{ color: '#4b5563', marginTop: '0.25rem' }}>Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="border border-black/20 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <div className="bg-black/5 p-4 grid grid-cols-2 border-b border-black/20" style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Billed To</p>
                                    <p className="font-bold text-lg" style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{edited.name}</p>
                                    <p className="text-sm mt-1" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{edited.phone}</p>
                                    <div className="text-sm mt-1" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        {edited.houseNo && <p>{edited.houseNo}</p>}
                                        {edited.city && <p>{edited.city}</p>}
                                        {edited.state && <p>{edited.state}</p>}
                                    </div>
                                </div>
                                <div className="text-right" style={{ textAlign: 'right' }}>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Stay Details</p>
                                    <p className="text-sm mt-1" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}><span style={{ fontWeight: 500 }}>Check-In:</span> {edited.checkIn ? new Date(edited.checkIn).toLocaleString() : ''}</p>
                                    <p className="text-sm mt-1" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}><span style={{ fontWeight: 500 }}>Check-Out:</span> {edited.checkOut ? new Date(edited.checkOut).toLocaleString() : ''}</p>
                                </div>
                            </div>
                            
                            <div className="p-4" style={{ padding: '1rem' }}>
                                <table className="w-full text-sm text-left mb-4" style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', marginBottom: '1rem', borderCollapse: 'collapse' }}>
                                    <thead className="text-xs text-gray-500 uppercase border-b border-black/10" style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                        <tr>
                                            <th className="pb-2 font-bold w-1/4" style={{ paddingBottom: '0.5rem', fontWeight: 'bold' }}>Room</th>
                                            <th className="pb-2 font-bold w-1/4" style={{ paddingBottom: '0.5rem', fontWeight: 'bold' }}>Type</th>
                                            <th className="pb-2 font-bold text-center w-1/6" style={{ paddingBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center' }}>Nights</th>
                                            <th className="pb-2 font-bold text-right w-1/6" style={{ paddingBottom: '0.5rem', fontWeight: 'bold', textAlign: 'right' }}>Price</th>
                                            <th className="pb-2 font-bold text-right w-1/6" style={{ paddingBottom: '0.5rem', fontWeight: 'bold', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {edited.rooms.map((r: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                <td className="py-2" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>{r.roomNo || "-"}</td>
                                                <td className="py-2" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>{r.roomType || "-"}</td>
                                                <td className="py-2 text-center" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', textAlign: 'center' }}>{edited.nights || 1}</td>
                                                <td className="py-2 text-right" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', textAlign: 'right' }}>₹{r.price || 0}</td>
                                                <td className="py-2 text-right font-medium" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', textAlign: 'right', fontWeight: 500 }}>₹{(r.price || 0) * (edited.nights || 1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 flex justify-between items-center bg-black/5 border-t border-black/20" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', borderTop: '1px solid rgba(0,0,0,0.2)' }}>
                                <span className="text-xl font-bold" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Total Amount Due</span>
                                <span className="text-3xl font-black" style={{ fontSize: '1.875rem', fontWeight: 900 }}>₹{edited.amount}</span>
                            </div>
                        </div>

                        <div className="mt-16 text-center text-gray-500 text-sm" style={{ marginTop: '4rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                            <p>Thank you for choosing {propName}!</p>
                            <p className="mt-1" style={{ marginTop: '0.25rem' }}>Terms & Conditions apply. This is a computer-generated invoice.</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

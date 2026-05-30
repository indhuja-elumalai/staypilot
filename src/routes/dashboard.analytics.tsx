import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { API_URL, getAuthHeaders } from "@/lib/api";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics · StayPilot" }] }),
  component: Analytics,
});

function Analytics() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [reportType, setReportType] = useState("Combined");
  const [dateRange, setDateRange] = useState("Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const headers = await getAuthHeaders(getToken);
              const [bRes, eRes] = await Promise.all([
                  fetch(`${API_URL}/bookings`, { headers }),
                  fetch(`${API_URL}/expenses`, { headers })
              ]);
              if (bRes.ok) setBookings(await bRes.json());
              if (eRes.ok) setExpenses(await eRes.json());
          } catch (err) { console.error(err); }
      };
      fetchData();
  }, [getToken]);

  const filterByDate = (dateField: string, range: string, data: any[]) => {
      const now = new Date();
      let start = new Date();
      let end = now;

      if (range === "Day") start.setDate(now.getDate() - 1);
      else if (range === "Week") start.setDate(now.getDate() - 7);
      else if (range === "Month") start.setMonth(now.getMonth() - 1);
      else if (range === "Custom") {
          start = customStart ? new Date(customStart) : new Date(0);
          end = customEnd ? new Date(customEnd) : now;
          // Ensure end includes the full day
          end.setHours(23, 59, 59, 999);
      }

      return data.filter(item => {
          const d = new Date(item[dateField]);
          return d >= start && d <= end;
      });
  };

  const filteredBookings = useMemo(() => {
      let filtered = filterByDate('createdAt', dateRange, bookings);
      if (reportType === "Bookings - Direct") filtered = filtered.filter(b => b.bookingSource === "Direct" || !b.bookingSource);
      if (reportType === "Bookings - Online") filtered = filtered.filter(b => b.bookingSource === "Online");
      return filtered;
  }, [dateRange, bookings, reportType, customStart, customEnd]);

  const filteredExpenses = useMemo(() => filterByDate('date', dateRange, expenses), [dateRange, expenses, customStart, customEnd]);

  const handlePrint = () => {
      const content = document.getElementById('printable-report-template');
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
              @page { margin: 1cm; size: A4 portrait; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f3f4f6; font-weight: bold; }
          }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(printDiv);
      
      window.print();
      
      document.body.removeChild(printDiv);
      document.head.removeChild(style);
  };

  const periodLabel = dateRange === "Custom" ? `${customStart} to ${customEnd}` : dateRange;

  return (
    <>
      <Topbar 
        title="Analytics & Reports" 
        subtitle="Generate detailed reports and analyze property performance." 
        action={
            <Button 
                onClick={() => {
                    setReportType("Combined");
                    setDateRange("Month");
                    setShowReport(true);
                }} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow"
            >
                <FileText className="h-4 w-4 mr-2" /> Generate Report
            </Button>
        }
      />
      <div className="p-6 lg:p-8 space-y-5">
        
        {/* Report Generator UI */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm bg-primary/5">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-primary" /> Report Generator</h2>
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Date Range" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Day">Last 24 Hours</SelectItem>
                            <SelectItem value="Week">Last 7 Days</SelectItem>
                            <SelectItem value="Month">Last 30 Days</SelectItem>
                            <SelectItem value="Custom">Custom Dates</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {dateRange === "Custom" && (
                    <div className="flex gap-2">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Start Date</label>
                            <Input type="date" className="bg-background" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">End Date</label>
                            <Input type="date" className="bg-background" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="flex-1 min-w-[250px]">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Report Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Combined">Combined Overview</SelectItem>
                            <SelectItem value="Bookings - Combined">Bookings - Combined</SelectItem>
                            <SelectItem value="Bookings - Direct">Bookings - Direct Only</SelectItem>
                            <SelectItem value="Bookings - Online">Bookings - Online Only</SelectItem>
                            <SelectItem value="Expenses">Expenses Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex gap-2">
                    <Button onClick={() => setShowReport(true)} variant="secondary" className="min-w-[140px]">Generate</Button>
                    <Button onClick={handlePrint} className="min-w-[160px]"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </div>
        </div>

        {showReport && (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                <div id="printable-report-template">
                    <div style={{ fontFamily: 'sans-serif', color: '#000' }}>
                        <h1 style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>StayPilot Report</h1>
                        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>Type: {reportType} | Period: {periodLabel}</p>

                        {(reportType === "Combined" || reportType.startsWith("Bookings")) && (
                            <div>
                                <h2 style={{ marginTop: '20px', color: '#39542C', fontSize: '18px', fontWeight: 'bold' }}>Booking Performance</h2>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9fafb' }}>Date</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9fafb' }}>Guest</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9fafb' }}>Source</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9fafb' }}>Platform</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'right', backgroundColor: '#f9fafb' }}>Net Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBookings.map((b: any, i: number) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #eaeaea' }}>
                                                    <td style={{ padding: '12px 8px' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ padding: '12px 8px' }}>{b.name}</td>
                                                    <td style={{ padding: '12px 8px' }}>{b.bookingSource || "Direct"}</td>
                                                    <td style={{ padding: '12px 8px' }}>{b.platformName || "-"}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>₹{b.amountForProperty || b.amount || 0}</td>
                                                </tr>
                                            ))}
                                            {filteredBookings.length === 0 && (<tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No bookings found in this period.</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', marginBottom: '40px' }}>
                                    Total Net Booking Revenue: ₹{filteredBookings.reduce((sum: number, b: any) => sum + Number(b.amountForProperty || b.amount || 0), 0).toLocaleString()}
                                </div>
                            </div>
                        )}

                        {(reportType === "Combined" || reportType === "Expenses") && (
                            <div>
                                <h2 style={{ marginTop: '30px', color: '#38240D', fontSize: '18px', fontWeight: 'bold' }}>Expense Ledger</h2>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9fafb' }}>Date</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9fafb' }}>Type</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9fafb' }}>Description</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '12px 8px', textAlign: 'right', backgroundColor: '#f9fafb' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExpenses.filter((e:any) => e.category === 'Deduction').map((e: any, i: number) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #eaeaea' }}>
                                                    <td style={{ padding: '12px 8px' }}>{new Date(e.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '12px 8px' }}>{e.type}</td>
                                                    <td style={{ padding: '12px 8px' }}>{e.description}</td>
                                                    <td style={{ padding: '12px 8px', color: 'red', textAlign: 'right' }}>-₹{e.amount}</td>
                                                </tr>
                                            ))}
                                            {filteredExpenses.filter((e:any) => e.category === 'Deduction').length === 0 && (<tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No expenses found in this period.</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
                                    Total Expenses: ₹{filteredExpenses.filter((e:any) => e.category === 'Deduction').reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0).toLocaleString()}
                                </div>
                            </div>
                        )}
                        
                        {reportType === "Combined" && (
                            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Net Period Income</h3>
                                <h1 style={{ margin: 0, color: '#39542C', fontSize: '28px' }}>
                                    ₹{(
                                        filteredBookings.reduce((sum: number, b: any) => sum + Number(b.amountForProperty || b.amount || 0), 0) - 
                                        filteredExpenses.filter((e:any) => e.category === 'Deduction').reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0)
                                    ).toLocaleString()}
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-border pt-4">
                    <Button onClick={handlePrint} size="lg"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </div>
        )}
      </div>
    </>
  );
}

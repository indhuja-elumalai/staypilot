import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ArrowUpRight, BedDouble, Users, Wallet, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from "recharts";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview · StayPilot" }] }),
  component: Overview,
});

export function StatusPill({ v }: { v: string }) {
  const map: Record<string, string> = {
    Confirmed: "bg-primary/10 text-primary",
    "Checked-in": "bg-success/10 text-success",
    Pending: "bg-warning/10 text-warning",
    Cancelled: "bg-destructive/10 text-destructive",
    VIP: "bg-primary/10 text-primary",
    Regular: "bg-muted text-muted-foreground",
  };
  return <span className={`text-xs px-2 py-1 rounded-md ${map[v] ?? "bg-muted text-muted-foreground"}`}>{v}</span>;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function Kpi({ icon: Icon, label, value, delta, up }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-soft">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="h-4 w-4" /></div>
        {delta && (
            <span className={`text-xs flex items-center gap-1 ${up ? "text-success" : "text-muted-foreground"}`}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : ""}{delta}
            </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Overview() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
      const fetchData = async () => {
          try {
              const headers = await getAuthHeaders(getToken);
              const [bRes, eRes, sRes] = await Promise.all([
                  fetch(`${API_URL}/bookings`, { headers }),
                  fetch(`${API_URL}/expenses`, { headers }),
                  fetch(`${API_URL}/settings`, { headers })
              ]);
              if (bRes.ok) setBookings(await bRes.json());
              if (eRes.ok) setExpenses(await eRes.json());
              if (sRes.ok) setSettings(await sRes.json());
          } catch (err) { console.error(err); }
      };
      fetchData();
  }, [getToken]);

  // KPIs
  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  
  const weeklyBookings = bookings.filter(b => new Date(b.createdAt) >= weekAgo);
  const weeklyRevenue = weeklyBookings.reduce((sum, b) => sum + Number(b.amountForProperty || b.amount || 0), 0);
  
  const activeBookings = bookings.filter(b => {
      if (b.actualCheckOutTime) return false;
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      return now >= start && now <= end;
  });

  // Advanced KPIs (Last 30 Days)
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const monthlyBookings = bookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo);
  const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + Number(b.amountForProperty || b.amount || 0), 0);
  
  const totalRoomsInProperty = settings?.totalRooms || 10;
  const totalAvailableRoomNights = totalRoomsInProperty * 30;

  let totalRoomsSold = 0;
  let totalNights = 0;
  
  monthlyBookings.forEach(b => {
      if (!b.checkIn || !b.checkOut) return;
      const n = Math.max(1, Math.floor(Math.abs(new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
      const rCount = Array.isArray(b.rooms) ? b.rooms.length : 1;
      totalNights += n;
      totalRoomsSold += (rCount * n);
  });

  const adr = totalRoomsSold > 0 ? Math.round(monthlyRevenue / totalRoomsSold) : 0;
  const occupancy = totalAvailableRoomNights > 0 ? Math.round((totalRoomsSold / totalAvailableRoomNights) * 100) : 0;
  const revpar = totalAvailableRoomNights > 0 ? Math.round(monthlyRevenue / totalAvailableRoomNights) : 0;
  const los = monthlyBookings.length > 0 ? (totalNights / monthlyBookings.length).toFixed(1) : "0.0";

  // Chart 1: Revenue vs Net Income (Last 7 Days)
  const revenueChartData = useMemo(() => {
      const days = [];
      for (let i=6; i>=0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayB = bookings.filter(b => new Date(b.createdAt).toDateString() === d.toDateString());
          const dayRev = dayB.reduce((sum, b) => sum + Number(b.amountForProperty || b.amount || 0), 0);
          
          const dayE = expenses.filter(e => new Date(e.date).toDateString() === d.toDateString() && e.category === 'Deduction');
          const dayExp = dayE.reduce((sum, e) => sum + Number(e.amount || 0), 0);
          
          days.push({ d: dateStr, Revenue: dayRev, NetIncome: dayRev - dayExp });
      }
      return days;
  }, [bookings, expenses]);

  // Occ vs Rev (Last 30 Days Trend)
  const occRevChartData = useMemo(() => {
      const days = [];
      const totalRooms = settings?.totalRooms || 10;
      
      for (let i=29; i>=0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const dateStr = `${d.getDate()}/${d.getMonth()+1}`;
          
          let dayRoomsSold = 0;
          let dayRev = 0;
          
          bookings.forEach(b => {
              if (!b.checkIn || !b.checkOut) return;
              const bStart = new Date(b.checkIn);
              const bEnd = new Date(b.checkOut);
              
              if (d >= bStart && d < bEnd) {
                  const rCount = Array.isArray(b.rooms) ? b.rooms.length : 1;
                  dayRoomsSold += rCount;
                  
                  const nights = Math.max(1, Math.floor(Math.abs(bEnd.getTime() - bStart.getTime()) / (1000 * 60 * 60 * 24)));
                  const revPerNight = Number(b.amountForProperty || b.amount || 0) / nights;
                  dayRev += revPerNight;
              }
          });
          
          const occ = totalRooms > 0 ? Math.min(100, Math.round((dayRoomsSold / totalRooms) * 100)) : 0;
          days.push({ d: dateStr, occ, rev: Math.round(dayRev) });
      }
      return days;
  }, [bookings, settings]);

  // Chart 2: Source Breakdown (Bar Chart)
  const sourceChartData = useMemo(() => {
      const direct = bookings.filter(b => !b.bookingSource || b.bookingSource === "Direct").length;
      const online = bookings.filter(b => b.bookingSource === "Online").length;
      return [
          { c: "Direct", v: direct },
          { c: "Online", v: online }
      ];
  }, [bookings]);

  // Daily Check-ins based on selected date
  const dailyCheckIns = useMemo(() => {
      return bookings.filter(b => {
          if (!b.checkIn) return false;
          const checkInDate = new Date(b.checkIn).toISOString().split('T')[0];
          return checkInDate === selectedDate;
      });
  }, [bookings, selectedDate]);

  const dailyRevenue = dailyCheckIns.reduce((sum, b) => sum + Number(b.amountForProperty || b.amount || 0), 0);
  
  const checkInHeading = useMemo(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDate === todayStr) return "Today's Check-ins";
      if (selectedDate > todayStr) return "Upcoming Check-ins";
      return "Past Check-ins";
  }, [selectedDate]);

  return (
    <>
      <Topbar
        title={`${getGreeting()}, ${user?.firstName || "Guest"}`}
        subtitle="Here is a summary of your property's financial performance and activity."
      />
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={Wallet} label="Revenue this week" value={`₹${weeklyRevenue.toLocaleString()}`} delta="Live" up />
          <Kpi icon={BedDouble} label="Active Guests" value={activeBookings.length} delta="In-House" up />
          <Kpi icon={Users} label="Total Bookings" value={bookings.length} delta="Lifetime" up />
          <Kpi icon={TrendingUp} label="Total Expenses" value={`₹${expenses.filter(e=>e.category==='Deduction').reduce((sum,e)=>sum+Number(e.amount),0).toLocaleString()}`} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {[
            ["RevPAR", `₹${revpar.toLocaleString()}`],
            ["ADR", `₹${adr.toLocaleString()}`],
            ["Occupancy", `${occupancy}%`],
            ["Avg LOS", `${los} Nights`]
          ].map(([k,v])=>(
            <div key={k} className="rounded-xl border border-border bg-card p-4 card-soft bg-muted/5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{k}</div>
              <div className="mt-1 text-xl font-bold">{v}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Last 30 days</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 rounded-xl border border-border bg-card card-soft overflow-hidden">
                <div className="px-5 h-16 flex items-center justify-between border-b border-border bg-muted/10">
                    <div>
                        <div className="text-sm font-semibold">{checkInHeading}</div>
                        <div className="text-xs text-muted-foreground">Revenue for {new Date(selectedDate).toLocaleDateString()}: <span className="font-bold text-success">₹{dailyRevenue.toLocaleString()}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="h-8 text-xs bg-background w-32"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground">
                            <tr className="border-b border-border bg-muted/20">
                                <th className="text-left font-medium px-5 py-3">Guest</th>
                                <th className="text-left font-medium py-3">Room</th>
                                <th className="text-left font-medium py-3">Source</th>
                                <th className="text-left font-medium py-3">Net Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyCheckIns.map((b, i) => (
                                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40">
                                    <td className="px-5 py-3 flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-medium">{b.name.substring(0,2).toUpperCase()}</div>
                                        <span className="font-medium">{b.name}</span>
                                    </td>
                                    <td className="py-3 text-muted-foreground">{Array.isArray(b.rooms) ? b.rooms.map((r:any)=>r.roomNo).join(", ") : b.roomNo}</td>
                                    <td className="py-3 text-muted-foreground">{b.bookingSource || "Direct"} {b.platformName ? `(${b.platformName})` : ''}</td>
                                    <td className="py-3 font-medium text-success">₹{b.amountForProperty || b.amount || 0}</td>
                                </tr>
                            ))}
                            {dailyCheckIns.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No check-ins on this date.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 card-soft flex flex-col">
                <div className="text-sm font-semibold">Booking Sources</div>
                <div className="text-xs text-muted-foreground">Direct vs Online channels</div>
                <div className="flex-1 min-h-[250px] mt-4">
                    <ResponsiveContainer>
                        <BarChart data={sourceChartData} margin={{ left: -20, right: 8, top: 8 }}>
                            <CartesianGrid stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="c" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="v" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-border bg-card p-5 card-soft">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold">Occupancy vs Daily Revenue</div>
                        <div className="text-xs text-muted-foreground">Last 30 days actuals</div>
                    </div>
                </div>
                <div className="h-72 mt-4">
                    <ResponsiveContainer>
                        <AreaChart data={occRevChartData} margin={{ left: -20, right: 8, top: 8 }}>
                            <defs>
                            <linearGradient id="o" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="var(--navy)" stopOpacity={0.35}/>
                                <stop offset="100%" stopColor="var(--navy)" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                            <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                            <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} hide/>
                            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                            <Area yAxisId="left" dataKey="occ" stroke="var(--navy)" strokeWidth={2} fill="url(#o)" name="Occupancy (%)" />
                            <Line yAxisId="right" dataKey="rev" stroke="var(--ember)" strokeWidth={2} dot={false} name="Revenue (₹)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 card-soft">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold">Revenue vs Net Income</div>
                        <div className="text-xs text-muted-foreground">Last 7 days actuals</div>
                    </div>
                </div>
                <div className="h-72 mt-4">
                    <ResponsiveContainer>
                        <AreaChart data={revenueChartData} margin={{ left: -20, right: 8, top: 8 }}>
                            <defs>
                            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="n" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.5} />
                                <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                            </linearGradient>
                            </defs>
                            <CartesianGrid stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                            <Area dataKey="Revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#g)" />
                            <Area dataKey="NetIncome" stroke="var(--success)" strokeWidth={2} fill="url(#n)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
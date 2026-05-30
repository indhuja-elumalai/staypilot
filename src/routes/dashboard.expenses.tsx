import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Plus, TrendingDown, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { API_URL, getAuthHeaders } from "@/lib/api";

export const Route = createFileRoute("/dashboard/expenses")({
  head: () => ({ meta: [{ title: "Expenses · StayPilot" }] }),
  component: Expenses,
});

function LogExpenseModal({ onSave }: { onSave: () => void }) {
    const { getToken } = useAuth();
    const [open, setOpen] = useState(false);
    const [f, setF] = useState({ type: "Bank", category: "Deduction", amount: "", description: "", date: new Date().toISOString().split('T')[0] });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = await getAuthHeaders(getToken);
            const res = await fetch(`${API_URL}/expenses`, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ ...f, amount: Number(f.amount) })
            });
            if (res.ok) {
                setF({ type: "Bank", category: "Deduction", amount: "", description: "", date: new Date().toISOString().split('T')[0] });
                setOpen(false);
                onSave();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow"><Plus className="h-4 w-4 mr-1" /> Log Entry</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Ledger Entry</DialogTitle>
                    <DialogDescription>Add a new expense or deposit to your ledger.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <Select value={f.type} onValueChange={(v) => setF({...f, type: v, category: v !== "Bank" ? "Deduction" : "Deduction"})}>
                        <SelectTrigger><SelectValue placeholder="Ledger Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Bank">Expense Bank (Daily Add-ons/Deductions)</SelectItem>
                            <SelectItem value="General">General Expenses (One-off)</SelectItem>
                            <SelectItem value="Monthly">Monthly Fixed (Salary, Rent, Utilities)</SelectItem>
                        </SelectContent>
                    </Select>

                    {f.type === "Bank" && (
                        <Select value={f.category} onValueChange={(v) => setF({...f, category: v})}>
                            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Deduction">Deduction (-)</SelectItem>
                                <SelectItem value="Deposit">Add-on Deposit (+)</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input type="date" required value={f.date} onChange={e => setF({...f, date: e.target.value})} />
                        <Input required placeholder="Description (e.g. Milk)" value={f.description} onChange={e => setF({...f, description: e.target.value})} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">₹</span>
                        <Input required type="number" placeholder="Amount" value={f.amount} onChange={e => setF({...f, amount: e.target.value})} className="text-lg" />
                    </div>

                    <Button type="submit" className="w-full mt-4">Save Entry</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Expenses() {
    const { getToken } = useAuth();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [bankStatus, setBankStatus] = useState<any>(null);

    const fetchData = async () => {
        try {
            const headers = await getAuthHeaders(getToken);
            const [expRes, bankRes] = await Promise.all([
                fetch(`${API_URL}/expenses`, { headers }),
                fetch(`${API_URL}/expenses/bank/status`, { headers })
            ]);
            setExpenses(await expRes.json());
            setBankStatus(await bankRes.json());
        } catch (err) {
            console.error("Error fetching ledger data:", err);
        }
    };

    useEffect(() => { fetchData(); }, [getToken]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            const headers = await getAuthHeaders(getToken);
            await fetch(`${API_URL}/expenses/${id}`, { method: "DELETE", headers });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const bankExp = expenses.filter(e => e.type === "Bank");
    const generalExp = expenses.filter(e => e.type === "General");
    const monthlyExp = expenses.filter(e => e.type === "Monthly");

    return (
        <>
            <Topbar
                title="Expenses & Ledger"
                subtitle="Manage your daily expense bank, fixed monthly overheads, and general costs."
                action={<LogExpenseModal onSave={fetchData} />}
            />
            <div className="p-6 lg:p-8 space-y-6">
                
                {bankStatus && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-border bg-card p-5 card-soft">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Running Bank Balance</div>
                            <div className={`mt-2 text-3xl font-bold tracking-tight ${bankStatus.currentBalance < 0 ? "text-destructive" : "text-primary"}`}>
                                ₹{bankStatus.currentBalance}
                            </div>
                            <div className="text-xs mt-1 text-muted-foreground">Rolling forward automatically</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-5 card-soft">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Budget Allocated</div>
                            <div className="mt-2 text-2xl font-semibold">₹{bankStatus.allocatedBudget}</div>
                            <div className="text-xs mt-1 text-muted-foreground">₹{bankStatus.dailyBudget}/day for {bankStatus.daysActive} days</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-5 card-soft">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Deductions</div>
                            <div className="mt-2 text-2xl font-semibold text-rose-500">₹{bankStatus.deductions}</div>
                            <div className="text-xs mt-1 text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Expenses paid</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-5 card-soft">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Add-on Deposits</div>
                            <div className="mt-2 text-2xl font-semibold text-emerald-500">₹{bankStatus.deposits}</div>
                            <div className="text-xs mt-1 text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Cash added to bank</div>
                        </div>
                    </div>
                )}

                <div className="rounded-xl border border-border bg-card card-soft overflow-hidden p-1">
                    <Tabs defaultValue="bank" className="w-full">
                        <div className="px-5 pt-3 pb-2 border-b border-border">
                            <TabsList className="bg-transparent space-x-2">
                                <TabsTrigger value="bank" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4">Expense Bank Ledger</TabsTrigger>
                                <TabsTrigger value="general" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4">General Log</TabsTrigger>
                                <TabsTrigger value="monthly" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4">Monthly/Fixed Log</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <TabsContent value="bank" className="m-0">
                            <ExpenseTable data={bankExp} onDelete={handleDelete} showCategory={true} />
                        </TabsContent>
                        <TabsContent value="general" className="m-0">
                            <ExpenseTable data={generalExp} onDelete={handleDelete} />
                        </TabsContent>
                        <TabsContent value="monthly" className="m-0">
                            <ExpenseTable data={monthlyExp} onDelete={handleDelete} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}

function ExpenseTable({ data, onDelete, showCategory = false }: { data: any[], onDelete: (id: string) => void, showCategory?: boolean }) {
    if (data.length === 0) return <div className="p-8 text-center text-muted-foreground text-sm">No expenses logged yet.</div>;
    return (
        <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/20">
                <tr>
                    <th className="text-left font-medium px-6 py-3">Date</th>
                    <th className="text-left font-medium px-6 py-3">Description</th>
                    {showCategory && <th className="text-left font-medium px-6 py-3">Type</th>}
                    <th className="text-right font-medium px-6 py-3">Amount</th>
                    <th className="w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {data.map((r) => (
                    <tr key={r._id} className="hover:bg-muted/10 group">
                        <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="px-6 py-3 font-medium">{r.description}</td>
                        {showCategory && (
                            <td className="px-6 py-3">
                                <span className={`text-xs px-2 py-1 rounded-md font-medium ${r.category === "Deposit" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                    {r.category}
                                </span>
                            </td>
                        )}
                        <td className={`px-6 py-3 font-bold text-right ${r.category === "Deposit" ? "text-emerald-500" : "text-foreground"}`}>
                            {r.category === "Deposit" ? "+" : ""}₹{r.amount}
                        </td>
                        <td className="px-6 py-3 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(r._id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

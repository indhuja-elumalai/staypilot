import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatusPill } from "./dashboard.index";
import { Star, Phone, Mail, Plus, Filter, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { NewCustomerModal } from "@/components/dashboard/NewCustomerModal";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({ meta: [{ title: "Customers · StayPilot" }] }),
  component: Customers,
});

function Customers() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [showOnlyVip, setShowOnlyVip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  
  const fetchCustomers = async () => {
    try {
      const headers = await getAuthHeaders(getToken);
      const res = await fetch(`${API_URL}/customers`, { headers });
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleVip = async (id: string, currentVip: boolean) => {
    try {
      setCustomers(customers.map(c => c._id === id ? { ...c, isVip: !currentVip } : c));
      const headers = await getAuthHeaders(getToken);
      await fetch(`${API_URL}/customers/${id}/star`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ isVip: !currentVip })
      });
    } catch (err) {
      console.error("Error toggling VIP status:", err);
      fetchCustomers();
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Delete this customer?")) return;
      try {
          const headers = await getAuthHeaders(getToken);
          await fetch(`${API_URL}/customers/${id}`, { method: "DELETE", headers });
          fetchCustomers();
      } catch (err) {
          console.error("Error deleting customer", err);
      }
  };

  const openNewModal = () => {
      setEditingCustomer(null);
      setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
      setEditingCustomer(c);
      setIsModalOpen(true);
  };

  const displayedCustomers = showOnlyVip ? customers.filter(c => c.isVip) : customers;

  return (
    <>
      <Topbar
        title="Customers"
        subtitle="Your guest CRM — searchable, sortable, human"
        action={<Button onClick={openNewModal} className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow"><Plus className="h-4 w-4 mr-1" /> Add guest</Button>}
      />
      <div className="p-6 lg:p-8 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Total guests", customers.length.toString()],
            ["VIP", customers.filter((c) => c.isVip).length.toString()],
            ["New this month", customers.filter((c) => new Date(c.createdAt).getMonth() === new Date().getMonth()).length.toString()],
            ["Repeat rate", customers.length ? `${Math.round((customers.filter((c) => c.stays > 1).length / customers.length) * 100)}%` : "0%"]
          ].map(([k,v])=>(
            <div key={k} className="rounded-xl border border-border bg-card p-4 card-soft">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="mt-1 text-lg font-semibold">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            variant={showOnlyVip ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowOnlyVip(!showOnlyVip)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showOnlyVip ? "Viewing VIPs" : "Filter VIPs"}
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card card-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                {["Guest","Contact","Stays","Address","Tier",""].map(h=>(
                  <th key={h} className="text-left font-medium px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedCustomers.map((c) => (
                <tr key={c._id} className="border-t border-border hover:bg-muted/30 group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-[11px] font-medium">
                        {c.name ? c.name.split(" ").map((x: string) => x[0]).join("") : "?"}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {c.name || "Unknown"} 
                          <button onClick={() => handleToggleVip(c._id, c.isVip)} className="focus:outline-none">
                            <Star className={`h-3.5 w-3.5 transition-colors ${c.isVip ? 'fill-primary text-primary' : 'text-muted-foreground/30 hover:text-primary'}`} />
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground">{c.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</div>
                  </td>
                  <td className="px-5 py-3">{c.stays || 1}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {c.city || c.state ? `${c.city || ''}${c.city && c.state ? ', ' : ''}${c.state || ''}` : "No address"}
                  </td>
                  <td className="px-5 py-3"><StatusPill v={c.isVip ? "VIP" : "Regular"} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(c)} className="h-8 w-8 text-blue-600 hover:bg-blue-50"><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedCustomers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No customers found.
            </div>
          )}
        </div>
      </div>
      
      <NewCustomerModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSaved={fetchCustomers} 
        customerToEdit={editingCustomer} 
      />
    </>
  );
}

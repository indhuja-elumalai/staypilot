import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { Plus, ListTodo, Edit2, Trash2, X, Check } from "lucide-react";

export const Route = createFileRoute("/dashboard/operations")({
  head: () => ({ meta: [{ title: "Operations · StayPilot" }] }),
  component: Operations,
});

function Operations() {
  const { getToken } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const fetchTasks = async () => {
    try {
      const headers = await getAuthHeaders(getToken);
      const res = await fetch(`${API_URL}/operations/tasks`, { headers });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching operations data:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const headers = await getAuthHeaders(getToken);
      const res = await fetch(`${API_URL}/operations/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: newTask, type: "task" })
      });
      if (res.ok) {
        setNewTask("");
        fetchTasks();
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t._id === id ? { 
        ...t, 
        completed, 
        closedAt: completed ? new Date().toISOString() : null 
      } : t));
      
      const headers = await getAuthHeaders(getToken);
      await fetch(`${API_URL}/operations/tasks/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ completed })
      });
      // Optionally fetch again to ensure sync, but optimistic is fine
    } catch (err) {
      console.error("Error toggling task:", err);
      fetchTasks(); // Revert on error
    }
  };

  const handleDeleteTask = async (id: string) => {
      if (!confirm("Are you sure you want to delete this task?")) return;
      try {
          const headers = await getAuthHeaders(getToken);
          await fetch(`${API_URL}/operations/tasks/${id}`, { method: "DELETE", headers });
          fetchTasks();
      } catch (err) {
          console.error("Error deleting task:", err);
      }
  };

  const saveEdit = async (id: string) => {
      if (!editText.trim()) {
          setEditingId(null);
          return;
      }
      try {
          const headers = await getAuthHeaders(getToken);
          await fetch(`${API_URL}/operations/tasks/${id}/edit`, {
              method: "PUT",
              headers,
              body: JSON.stringify({ text: editText })
          });
          setEditingId(null);
          fetchTasks();
      } catch (err) {
          console.error("Error editing task:", err);
      }
  };

  const startEdit = (t: any) => {
      setEditingId(t._id);
      setEditText(t.text);
  };

  const openTasks = tasks.filter(t => !t.completed);
  const closedTasks = tasks.filter(t => t.completed);

  return (
    <>
      <Topbar 
        title="Operations" 
        subtitle="Manage complaints and daily tasks in one unified list"
        action={
          <Button onClick={() => document.getElementById("new-task-input")?.focus()} className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        }
      />
      
      <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Property Operations</h2>
            </div>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
              {openTasks.length} pending
            </span>
          </div>
          
          <div className="flex gap-2 mb-8">
            <Input 
              id="new-task-input"
              placeholder="Add a new task or log a complaint..." 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="h-12 text-base shadow-sm"
            />
            <Button onClick={handleAddTask} type="button" size="lg" className="shrink-0 h-12 w-12 px-0">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 space-y-6">
            {tasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 flex flex-col items-center col-span-2">
                <ListTodo className="h-10 w-10 mb-4 opacity-20" />
                <p>All caught up! No active complaints or tasks.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {openTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Active</h3>
                    {openTasks.map(t => (
                      <div key={t._id} className="group flex items-start gap-4 p-4 hover:bg-muted/40 rounded-xl transition-colors border border-transparent hover:border-border/60">
                        <Checkbox 
                          id={`task-${t._id}`} 
                          checked={t.completed} 
                          onCheckedChange={(checked) => handleToggleTask(t._id, checked as boolean)} 
                          className="mt-1 h-5 w-5 rounded-md"
                        />
                        <div className="flex-1">
                          {editingId === t._id ? (
                              <div className="flex gap-2">
                                  <Input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(t._id)} className="h-8" />
                                  <Button size="icon" variant="ghost" onClick={() => saveEdit(t._id)} className="h-8 w-8 text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></Button>
                                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></Button>
                              </div>
                          ) : (
                              <label 
                                htmlFor={`task-${t._id}`} 
                                className="text-base font-medium cursor-pointer block"
                              >
                                {t.text}
                              </label>
                          )}
                          <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                            <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {editingId !== t._id && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => startEdit(t)} className="h-8 w-8 text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(t._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {closedTasks.length > 0 && (
                  <div className="space-y-2 p-4 bg-muted/20 rounded-xl border border-border/50 h-full">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Completed</h3>
                    {closedTasks.map(t => (
                      <div key={t._id} className="group flex items-start gap-4 p-4 opacity-60 hover:opacity-100 transition-opacity rounded-xl hover:bg-muted/40">
                        <Checkbox 
                          id={`task-${t._id}`} 
                          checked={t.completed} 
                          onCheckedChange={(checked) => handleToggleTask(t._id, checked as boolean)} 
                          className="mt-1 h-5 w-5 rounded-md"
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={`task-${t._id}`} 
                            className="text-base font-medium cursor-pointer line-through block text-muted-foreground"
                          >
                            {t.text}
                          </label>
                          <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                            {t.closedAt && (
                              <span className="text-emerald-600/70">
                                Completed: {new Date(t.closedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(t._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

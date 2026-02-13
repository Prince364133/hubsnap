import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Trash2, Plus, Calendar, Clock, Mail, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface ExportSchedule {
    id: string;
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    filters: {
        status?: string;
        plan?: string;
    };
    emailRecipients: string[];
    enabled: boolean;
    lastRun?: Timestamp;
    nextRun?: Timestamp;
}

interface ExportScheduleManagerProps {
    onClose: () => void;
}

export default function ExportScheduleManager({ onClose }: ExportScheduleManagerProps) {
    const [schedules, setSchedules] = useState<ExportSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<Partial<ExportSchedule>>({
        name: "",
        frequency: "daily",
        filters: {},
        emailRecipients: [],
        enabled: true
    });
    const [emailInput, setEmailInput] = useState("");

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "exportSchedules"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExportSchedule));
            setSchedules(data);
        } catch (error) {
            console.error("Error fetching schedules:", error);
            toast.error("Failed to load schedules");
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!currentSchedule.name) {
            toast.error("Name is required");
            return;
        }

        try {
            const scheduleData = {
                ...currentSchedule,
                emailRecipients: currentSchedule.emailRecipients || [],
                updatedAt: serverTimestamp()
            };

            if (currentSchedule.id) {
                await updateDoc(doc(db, "exportSchedules", currentSchedule.id), scheduleData);
                toast.success("Schedule updated");
            } else {
                await addDoc(collection(db, "exportSchedules"), {
                    ...scheduleData,
                    createdAt: serverTimestamp(),
                    nextRun: serverTimestamp() // Simple default for now
                });
                toast.success("Schedule created");
            }
            setIsEditing(false);
            fetchSchedules();
        } catch (error) {
            console.error("Error saving schedule:", error);
            toast.error("Failed to save schedule");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await deleteDoc(doc(db, "exportSchedules", id));
            toast.success("Schedule deleted");
            fetchSchedules();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            toast.error("Failed to delete schedule");
        }
    };

    const addEmail = () => {
        if (!emailInput || !emailInput.includes('@')) return;
        const current = currentSchedule.emailRecipients || [];
        setCurrentSchedule({
            ...currentSchedule,
            emailRecipients: [...current, emailInput]
        });
        setEmailInput("");
    };

    const removeEmail = (email: string) => {
        const current = currentSchedule.emailRecipients || [];
        setCurrentSchedule({
            ...currentSchedule,
            emailRecipients: current.filter(e => e !== email)
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Export Schedules</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* List View */}
                    {!isEditing && (
                        <>
                            <div className="flex justify-end">
                                <Button onClick={() => {
                                    setCurrentSchedule({
                                        name: "",
                                        frequency: "daily",
                                        filters: {},
                                        emailRecipients: [],
                                        enabled: true
                                    });
                                    setIsEditing(true);
                                }}>
                                    <Plus className="size-4 mr-2" />
                                    New Schedule
                                </Button>
                            </div>

                            <div className="border rounded-md divide-y">
                                {loading ? (
                                    <div className="p-4 text-center text-slate-500">Loading...</div>
                                ) : schedules.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500">No active schedules</div>
                                ) : (
                                    schedules.map(schedule => (
                                        <div key={schedule.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {schedule.name}
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${schedule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {schedule.enabled ? 'Active' : 'Disabled'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-500 flex gap-4 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar className="size-3" /> {schedule.frequency}</span>
                                                    <span className="flex items-center gap-1"><Mail className="size-3" /> {schedule.emailRecipients?.length || 0} recipients</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => { setCurrentSchedule(schedule); setIsEditing(true); }}>
                                                    <Edit2 className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {/* Edit View */}
                    {isEditing && (
                        <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                            <h3 className="font-medium">{currentSchedule.id ? 'Edit Schedule' : 'New Schedule'}</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Schedule Name</Label>
                                    <Input
                                        value={currentSchedule.name}
                                        onChange={e => setCurrentSchedule({ ...currentSchedule, name: e.target.value })}
                                        placeholder="e.g. Monthly Active Users"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <select
                                        value={currentSchedule.frequency}
                                        onChange={(e: any) => setCurrentSchedule({ ...currentSchedule, frequency: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Filters (Optional)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={currentSchedule.filters?.plan || 'all'}
                                        onChange={(e) => setCurrentSchedule({
                                            ...currentSchedule,
                                            filters: {
                                                ...currentSchedule.filters,
                                                plan: e.target.value === 'all' ? undefined : e.target.value
                                            }
                                        })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                                    >
                                        <option value="all">All Plans</option>
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="pro_plus">Pro Plus</option>
                                    </select>

                                    <select
                                        value={currentSchedule.filters?.status || 'all'}
                                        onChange={(e) => setCurrentSchedule({
                                            ...currentSchedule,
                                            filters: {
                                                ...currentSchedule.filters,
                                                status: e.target.value === 'all' ? undefined : e.target.value
                                            }
                                        })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Email Recipients</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={emailInput}
                                        onChange={e => setEmailInput(e.target.value)}
                                        placeholder="Enter email address"
                                        onKeyDown={e => e.key === 'Enter' && addEmail()}
                                    />
                                    <Button onClick={addEmail} type="button" variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {currentSchedule.emailRecipients?.map(email => (
                                        <span key={email} className="bg-white border px-2 py-1 rounded-md text-sm flex items-center gap-1">
                                            {email}
                                            <button onClick={() => removeEmail(email)} className="text-slate-400 hover:text-red-500">
                                                <Trash2 className="size-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enabled"
                                    checked={currentSchedule.enabled}
                                    onCheckedChange={(checked) => setCurrentSchedule({ ...currentSchedule, enabled: checked as boolean })}
                                />
                                <Label htmlFor="enabled">Enable Schedule</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave}>Save Schedule</Button>
                            </div>
                        </div>
                    )}

                </div>
                <DialogFooter>
                    {!isEditing && <Button onClick={onClose} variant="outline">Close</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

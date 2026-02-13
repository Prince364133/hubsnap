"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
    Search,
    Reply,
    MoreVertical,
    Trash2,
    CheckCircle,
    Loader2,
    Send,
    Inbox
} from "lucide-react";
import { collection, query, orderBy, getDocs, where, limit, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export default function InboxPage() {
    const [emails, setEmails] = useState<any[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            const q = query(collection(db, 'email_replies'), orderBy('receivedAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            setEmails(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error) {
            console.error("Error fetching inbox:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmail = async (email: any) => {
        setSelectedEmail(email);
        if (email.status === 'unread') {
            // Mark as read
            try {
                await updateDoc(doc(db, 'email_replies', email.id), { status: 'read' });
                // Update local state
                setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'read' } : e));
            } catch (e) {
                console.error("Failed to mark as read", e);
            }
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedEmail) return;
        setSending(true);

        try {
            await addDoc(collection(db, 'email_queue'), {
                to: selectedEmail.from,
                subject: `Re: ${selectedEmail.subject}`,
                html: `<p>${replyText.replace(/\n/g, '<br>')}</p><br><hr><blockquote>${selectedEmail.body}</blockquote>`,
                status: 'pending',
                priority: 1,
                createdAt: new Date(),
                retryCount: 0,
                metadata: {
                    replyToId: selectedEmail.id,
                    type: 'reply'
                }
            });

            toast.success("Reply queued successfully");
            setReplyText("");
        } catch (error: any) {
            console.error("Failed to send reply:", error);
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex border border-slate-200 rounded-lg overflow-hidden bg-white">
            {/* Email List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input placeholder="Search inbox..." className="pl-9" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading inbox...</div>
                    ) : emails.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Inbox is empty</div>
                    ) : (
                        emails.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => handleSelectEmail(email)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                                    } ${email.status === 'unread' ? 'border-l-4 border-l-blue-500 pl-3' : 'pl-4'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${email.status === 'unread' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                        {email.from}
                                    </h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                        {email.receivedAt?.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-sm mb-1 truncate ${email.status === 'unread' ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                    {email.subject}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {email.body?.substring(0, 50)}...
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Email Detail */}
            <div className="flex-1 flex flex-col">
                {selectedEmail ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-10">
                                    <AvatarFallback>{selectedEmail.from?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedEmail.subject}</h2>
                                    <p className="text-sm text-slate-500">From: <span className="text-slate-900 font-medium">{selectedEmail.from}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="size-4 text-slate-500" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="size-4 text-slate-500" />
                                </Button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                            <div className="prose max-w-none text-slate-800 whitespace-pre-wrap">
                                {selectedEmail.body}
                                {/* In real app, safeguard this HTML or use iframe if it's full HTML email */}
                            </div>
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t border-slate-200 bg-white">
                            <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                <Textarea
                                    placeholder="Type your reply..."
                                    className="border-none focus-visible:ring-0 resize-none min-h-[100px] p-4"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <div className="p-2 bg-slate-50 flex justify-end border-t border-slate-100">
                                    <Button onClick={handleSendReply} disabled={sending || !replyText.trim()}>
                                        {sending ? (
                                            <><Loader2 className="animate-spin size-4 mr-2" /> Sending...</>
                                        ) : (
                                            <><Send className="size-4 mr-2" /> Send Reply</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Inbox className="size-16 mb-4 opacity-20" />
                        <p>Select an email to read</p>
                    </div>
                )}
            </div>
        </div>
    );
}

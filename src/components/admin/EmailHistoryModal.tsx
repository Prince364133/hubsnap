import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { Loader2, Mail, CheckCircle2, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

interface EmailLog {
    id: string;
    subject: string;
    recipientCount: number;
    status: 'sending' | 'completed' | 'failed';
    sentAt: Timestamp;
    completedAt?: Timestamp;
    results?: {
        sent: number;
        failed: number;
    };
    error?: string;
}

interface EmailHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmailHistoryModal({ open, onOpenChange }: EmailHistoryModalProps) {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'emailLogs'),
                orderBy('sentAt', 'desc'),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as EmailLog[];
            setLogs(fetchedLogs);
        } catch (error) {
            console.error("Error fetching email logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchLogs();
        }
    }, [open]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'sending': return 'warning';
            case 'failed': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                <Mail className="size-5" />
                                Email History
                            </DialogTitle>
                            <DialogDescription>
                                View status and results of recent bulk email campaigns.
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchLogs} disabled={loading}>
                            <RefreshCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-4">
                    {loading && logs.length === 0 ? (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="size-8 animate-spin mb-2" />
                            <p>Loading history...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                            <Mail className="size-12 mx-auto mb-3 opacity-20" />
                            <p>No email history found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="border rounded-lg p-4 bg-card hover:bg-muted/5 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-base">{log.subject}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {format(log.sentAt.toDate(), 'PPP p')}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusColor(log.status) as any}>
                                            {log.status.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t">
                                        <div className="flex items-center gap-2">
                                            <Mail className="size-4 text-muted-foreground" />
                                            <span className="font-medium">{log.recipientCount}</span> Recipients
                                        </div>
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle2 className="size-4" />
                                            <span className="font-medium">{log.results?.sent || 0}</span> Sent
                                        </div>
                                        <div className="flex items-center gap-2 text-destructive">
                                            <XCircle className="size-4" />
                                            <span className="font-medium">{log.results?.failed || 0}</span> Failed
                                        </div>
                                    </div>

                                    {log.error && (
                                        <div className="mt-3 p-2 bg-destructive/10 text-destructive text-sm rounded flex items-center gap-2">
                                            <AlertCircle className="size-4" />
                                            {log.error}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

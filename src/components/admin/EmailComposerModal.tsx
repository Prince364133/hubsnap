"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/firestore";
import { emailTemplates, renderTemplate } from "@/lib/email-templates";
import { Button } from "@/components/ui/Button";
import { X, Mail, Send } from "lucide-react";

interface EmailComposerModalProps {
    selectedUsers: UserProfile[];
    onClose: () => void;
    onSend: (subject: string, body: string) => Promise<void>;
}

type TemplateType = 'welcome' | 'planUpgrade' | 'walletCredit' | 'custom';

export default function EmailComposerModal({ selectedUsers, onClose, onSend }: EmailComposerModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('custom');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleTemplateChange = (template: TemplateType) => {
        setSelectedTemplate(template);
        const templateData = emailTemplates[template];
        setSubject(templateData.subject);
        setBody(templateData.body);
    };

    const handleSend = async () => {
        if (!subject.trim() || !body.trim()) {
            alert('Please fill in both subject and body');
            return;
        }

        if (!confirm(`Send email to ${selectedUsers.length} users?`)) {
            return;
        }

        setSending(true);
        try {
            await onSend(subject, body);
            alert(`Email sent to ${selectedUsers.length} users successfully!`);
            onClose();
        } catch (error: any) {
            alert(`Failed to send emails: ${error.message}`);
        }
        setSending(false);
    };

    const previewEmail = () => {
        if (selectedUsers.length === 0) return { subject: '', body: '' };

        const user = selectedUsers[0];
        return {
            subject: renderTemplate(subject, {
                name: user.name || 'User',
                plan: user.plan || 'free',
                walletBalance: user.walletBalance || 0,
                referralCode: user.referralCode || 'N/A',
                amount: 0
            }),
            body: renderTemplate(body, {
                name: user.name || 'User',
                plan: user.plan || 'free',
                walletBalance: user.walletBalance || 0,
                referralCode: user.referralCode || 'N/A',
                amount: 0
            })
        };
    };

    const preview = previewEmail();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Mail className="size-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Send Bulk Email</h2>
                            <p className="text-sm text-slate-600">
                                Compose email for {selectedUsers.length} recipients
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="size-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Composer */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Template
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateChange(e.target.value as TemplateType)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                >
                                    <option value="custom">Custom Message</option>
                                    <option value="welcome">Welcome Email</option>
                                    <option value="planUpgrade">Plan Upgrade</option>
                                    <option value="walletCredit">Wallet Credit</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                    placeholder="Email subject..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Message Body
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={12}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm"
                                    placeholder="Email body... Use {{name}}, {{plan}}, {{walletBalance}}, {{referralCode}} for personalization"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-blue-900 mb-1">Available Variables:</h4>
                                <div className="text-xs text-blue-700 space-y-0.5">
                                    <div><code className="bg-blue-100 px-1 rounded">{'{{name}}'}</code> - User's name</div>
                                    <div><code className="bg-blue-100 px-1 rounded">{'{{plan}}'}</code> - User's plan</div>
                                    <div><code className="bg-blue-100 px-1 rounded">{'{{walletBalance}}'}</code> - Wallet balance</div>
                                    <div><code className="bg-blue-100 px-1 rounded">{'{{referralCode}}'}</code> - Referral code</div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700">
                                    Preview (First Recipient)
                                </label>
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                    {showPreview ? 'Hide' : 'Show'} Preview
                                </button>
                            </div>

                            {showPreview && (
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                        <div className="text-xs text-slate-600 mb-1">To:</div>
                                        <div className="text-sm font-medium text-slate-900">
                                            {selectedUsers[0]?.email || 'user@example.com'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                        <div className="text-xs text-slate-600 mb-1">Subject:</div>
                                        <div className="text-sm font-medium text-slate-900">
                                            {preview.subject || '(No subject)'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                            {preview.body || '(No content)'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recipients List */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Recipients ({selectedUsers.length})
                                </label>
                                <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                                    {selectedUsers.slice(0, 50).map((user) => (
                                        <div key={user.id} className="px-4 py-2 border-b border-slate-100 last:border-0">
                                            <div className="text-sm font-medium text-slate-900">{user.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    ))}
                                    {selectedUsers.length > 50 && (
                                        <div className="px-4 py-2 text-sm text-slate-500 bg-slate-50">
                                            + {selectedUsers.length - 50} more recipients
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 flex items-center justify-between bg-slate-50">
                    <Button onClick={onClose} variant="outline">Cancel</Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || !subject.trim() || !body.trim()}
                    >
                        <Send className="size-4 mr-2" />
                        {sending ? 'Sending...' : `Send to ${selectedUsers.length} Users`}
                    </Button>
                </div>
            </div>
        </div>
    );
}

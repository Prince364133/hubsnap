"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { X, Edit, AlertCircle } from "lucide-react";

interface BulkEditModalProps {
    selectedUsers: UserProfile[];
    onClose: () => void;
    onComplete: () => void;
}

type EditField = 'plan' | 'status' | 'wallet';

export default function BulkEditModal({ selectedUsers, onClose, onComplete }: BulkEditModalProps) {
    const [editFields, setEditFields] = useState<Set<EditField>>(new Set());
    const [plan, setPlan] = useState<string>('free');
    const [status, setStatus] = useState<string>('active');
    const [walletAdjustment, setWalletAdjustment] = useState<number>(0);
    const [walletOperation, setWalletOperation] = useState<'add' | 'subtract' | 'set'>('add');
    const [updating, setUpdating] = useState(false);

    const toggleField = (field: EditField) => {
        const newFields = new Set(editFields);
        if (newFields.has(field)) {
            newFields.delete(field);
        } else {
            newFields.add(field);
        }
        setEditFields(newFields);
    };

    const handleUpdate = async () => {
        if (editFields.size === 0) {
            alert('Please select at least one field to update');
            return;
        }

        if (!confirm(`Update ${selectedUsers.length} users? This action cannot be undone.`)) {
            return;
        }

        setUpdating(true);
        try {
            const batch = writeBatch(db);
            let batchCount = 0;

            for (const user of selectedUsers) {
                if (!user.id) continue;

                const updates: any = {};

                if (editFields.has('plan')) {
                    updates.plan = plan;
                }

                if (editFields.has('status')) {
                    updates.status = status;
                }

                if (editFields.has('wallet')) {
                    const currentBalance = user.walletBalance || 0;
                    if (walletOperation === 'add') {
                        updates.walletBalance = currentBalance + walletAdjustment;
                    } else if (walletOperation === 'subtract') {
                        updates.walletBalance = Math.max(0, currentBalance - walletAdjustment);
                    } else {
                        updates.walletBalance = walletAdjustment;
                    }
                }

                batch.update(doc(db, 'users', user.id), updates);
                batchCount++;

                // Firestore batch limit is 500
                if (batchCount >= 500) {
                    await batch.commit();
                    batchCount = 0;
                }
            }

            // Commit remaining batch
            if (batchCount > 0) {
                await batch.commit();
            }

            alert(`Successfully updated ${selectedUsers.length} users`);
            onComplete();
            onClose();
        } catch (error: any) {
            alert(`Update failed: ${error.message}`);
        }
        setUpdating(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Edit className="size-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Bulk Edit Users</h2>
                            <p className="text-sm text-slate-600">
                                Update {selectedUsers.length} selected users
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="size-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Warning */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                            <strong>Warning:</strong> This will update all {selectedUsers.length} selected users.
                            This action cannot be undone. Please review carefully before proceeding.
                        </div>
                    </div>

                    {/* Plan Update */}
                    <div className="border border-slate-200 rounded-lg p-4">
                        <label className="flex items-center gap-3 mb-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editFields.has('plan')}
                                onChange={() => toggleField('plan')}
                                className="rounded border-slate-300"
                            />
                            <span className="font-medium text-slate-900">Update Plan</span>
                        </label>
                        {editFields.has('plan') && (
                            <div className="ml-7">
                                <select
                                    value={plan}
                                    onChange={(e) => setPlan(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                >
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                    <option value="pro_plus">Pro+</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Status Update */}
                    <div className="border border-slate-200 rounded-lg p-4">
                        <label className="flex items-center gap-3 mb-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editFields.has('status')}
                                onChange={() => toggleField('status')}
                                className="rounded border-slate-300"
                            />
                            <span className="font-medium text-slate-900">Update Status</span>
                        </label>
                        {editFields.has('status') && (
                            <div className="ml-7">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                >
                                    <option value="highly_active">Highly Active</option>
                                    <option value="active">Active</option>
                                    <option value="at_risk">At Risk</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Wallet Update */}
                    <div className="border border-slate-200 rounded-lg p-4">
                        <label className="flex items-center gap-3 mb-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editFields.has('wallet')}
                                onChange={() => toggleField('wallet')}
                                className="rounded border-slate-300"
                            />
                            <span className="font-medium text-slate-900">Adjust Wallet Balance</span>
                        </label>
                        {editFields.has('wallet') && (
                            <div className="ml-7 space-y-3">
                                <div className="flex gap-3">
                                    <select
                                        value={walletOperation}
                                        onChange={(e) => setWalletOperation(e.target.value as any)}
                                        className="px-3 py-2 border border-slate-300 rounded-md"
                                    >
                                        <option value="add">Add</option>
                                        <option value="subtract">Subtract</option>
                                        <option value="set">Set to</option>
                                    </select>
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                        <input
                                            type="number"
                                            value={walletAdjustment}
                                            onChange={(e) => setWalletAdjustment(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {walletOperation === 'add' && `Add ₹${walletAdjustment} to each user's wallet`}
                                    {walletOperation === 'subtract' && `Subtract ₹${walletAdjustment} from each user's wallet`}
                                    {walletOperation === 'set' && `Set each user's wallet to ₹${walletAdjustment}`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {editFields.size > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Changes to be applied:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                {editFields.has('plan') && <li>• Plan will be changed to: <strong>{plan.toUpperCase()}</strong></li>}
                                {editFields.has('status') && <li>• Status will be changed to: <strong>{status.replace('_', ' ').toUpperCase()}</strong></li>}
                                {editFields.has('wallet') && (
                                    <li>• Wallet balance will be {walletOperation === 'set' ? 'set to' : walletOperation === 'add' ? 'increased by' : 'decreased by'}: <strong>₹{walletAdjustment}</strong></li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 flex items-center justify-between bg-slate-50">
                    <Button onClick={onClose} variant="outline">Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={updating || editFields.size === 0}
                    >
                        {updating ? 'Updating...' : `Update ${selectedUsers.length} Users`}
                    </Button>
                </div>
            </div>
        </div>
    );
}

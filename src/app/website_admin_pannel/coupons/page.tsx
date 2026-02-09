"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import { dbService } from "@/lib/firestore";
// For Mock purposes as requested in previous turn (Demo API), we will visualize the FREEHUB36 toggle

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        const data = await dbService.getCoupons();
        setCoupons(data);
        setLoading(false);
    };

    const addNewCoupon = async () => {
        const code = prompt("Enter Coupon Code");
        if (!code) return;

        const type = prompt("Type (percent/flat)?", "percent");
        const value = prompt("Value (e.g. 100 for 100% off)?", "100");

        if (code && type && value) {
            await dbService.createCoupon({
                code: code.toUpperCase(),
                discountType: type as 'percent' | 'flat',
                discountValue: Number(value),
                active: true,
                usageCount: 0
            });
            loadCoupons();
        }
    };

    const deleteCoupon = async (id: string) => {
        if (confirm("Are you sure?")) {
            await dbService.deleteCoupon(id);
            loadCoupons();
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await dbService.toggleCouponStatus(id, !currentStatus);
        loadCoupons();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Manage Coupons</h1>
                <Button onClick={addNewCoupon}>
                    <Plus className="size-4 mr-2" />
                    Create Coupon
                </Button>
            </div>

            <div className="grid gap-4">
                {coupons.map((coupon) => (
                    <Card key={coupon.id} className="p-4 flex items-center justify-between border-slate-200 bg-white">
                        <div className="flex items-center gap-6">
                            <div className="bg-slate-100 px-3 py-1.5 rounded font-mono font-bold text-slate-700">
                                {coupon.code}
                            </div>
                            <div className="text-sm text-slate-500">
                                <span className="font-semibold text-slate-900">
                                    {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                </span> Off
                            </div>
                            <div className="text-xs text-slate-400">
                                Used {coupon.usageCount} times
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggleStatus(coupon.id, coupon.active)} className="focus:outline-none transition-colors">
                                {coupon.active ? (
                                    <ToggleRight className="size-8 text-green-500" />
                                ) : (
                                    <ToggleLeft className="size-8 text-slate-300" />
                                )}
                            </button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteCoupon(coupon.id)}>
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </Card>
                ))}

                {coupons.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        No coupons found. Create one above!
                    </div>
                )}
            </div>
        </div>
    );
}

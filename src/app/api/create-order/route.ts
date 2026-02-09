import { NextResponse } from "next/server";
import { dbService } from "@/lib/firestore";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, coupon } = body;

        let finalAmount = amount;
        let discount = 0;

        // 1. Validate Coupon against Firestore
        if (coupon) {
            const couponData = await dbService.getCouponByCode(coupon.toUpperCase());

            if (couponData && couponData.active) {
                if (couponData.discountType === 'percent') {
                    // Calculate percentage discount
                    const discountAmount = (amount * couponData.discountValue) / 100;
                    discount = discountAmount;
                    finalAmount = amount - discountAmount;
                } else if (couponData.discountType === 'flat') {
                    // Flat discount
                    discount = couponData.discountValue;
                    finalAmount = Math.max(0, amount - discount);
                }

                // Increment usage? We might want to do this only on successful payment webhook, 
                // but for this flow let's assume usage happens on order creation for simplicity 
                // or leave it for the webhook (which is mocked). 
                // Let's NOT increment here to avoid abuse on abandoned carts.
            }
        }

        // 2. Mock Order Creation (Simulating Razorpay)
        const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        return NextResponse.json({
            id: mockOrderId,
            currency: "INR",
            amount: finalAmount * 100, // Razorpay expects paise
            originalAmount: amount,
            discount: discount
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

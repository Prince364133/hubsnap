export const emailTemplates = {
    welcome: {
        subject: "Welcome to HubSnap! 🎉",
        body: `Hi {{name}},

Welcome to HubSnap! We're thrilled to have you on board.

Your account has been successfully created and you're all set to start creating amazing content.

**Your Account Details:**
- Plan: {{plan}}
- Wallet Balance: ₹{{walletBalance}}
- Referral Code: {{referralCode}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The HubSnap Team`
    },
    planUpgrade: {
        subject: "Your Plan Has Been Upgraded! 🚀",
        body: `Hi {{name}},

Great news! Your HubSnap plan has been upgraded to {{plan}}.

You now have access to all premium features including:
- Advanced analytics
- Priority support
- Unlimited content generation
- And much more!

Start exploring your new features today.

Best regards,
The HubSnap Team`
    },
    walletCredit: {
        subject: "Wallet Credit Added! 💰",
        body: `Hi {{name}},

₹{{amount}} has been added to your HubSnap wallet!

**Your New Balance:** ₹{{walletBalance}}

You can use your wallet balance for:
- Premium features
- Content generation
- Tool upgrades

Thank you for being a valued member of HubSnap.

Best regards,
The HubSnap Team`
    },
    custom: {
        subject: "",
        body: ""
    }
};

export function renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
        rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return rendered;
}

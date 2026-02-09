"use client";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { TableOfContents } from "@/components/legal/TableOfContents";

const termsItems = [
    { id: "agreement", title: "1. Agreement to Terms" },
    { id: "service-description", title: "2. Description of Service" },
    { id: "user-accounts", title: "3. User Accounts" },
    { id: "subscription", title: "4. Subscription and Payments" },
    { id: "acceptable-use", title: "5. Acceptable Use" },
    { id: "ip", title: "6. Intellectual Property" },
    { id: "disclaimers", title: "7. Disclaimers and Limitations" },
    { id: "third-party", title: "8. Third-Party Services" },
    { id: "termination", title: "9. Termination" },
    { id: "indemnification", title: "10. Indemnification" },
    { id: "governing-law", title: "11. Governing Law" },
    { id: "changes", title: "12. Changes to Terms" },
    { id: "contact", title: "13. Contact Information" },
];

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <PublicHeader />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
                        <p className="text-slate-500">Last updated: February 9, 2026</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 relative items-start">
                        {/* Sidebar */}
                        <aside className="hidden lg:block lg:w-1/4 sticky top-32">
                            <TableOfContents items={termsItems} />
                        </aside>

                        {/* Main Content */}
                        <article className="lg:w-3/4 prose prose-slate max-w-none bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                            <section id="agreement" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Agreement to Terms</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    By accessing or using HubSnap's Creator OS platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
                                </p>
                            </section>

                            <section id="service-description" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">2. Description of Service</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Creator OS is a platform that provides AI-powered tools and resources for content creators, including:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li>Channel idea generation and niche discovery</li>
                                    <li>Content planning and script generation</li>
                                    <li>Trend analysis and insights</li>
                                    <li>Digital business blueprints and guides</li>
                                    <li>AI tools directory and recommendations</li>
                                </ul>
                            </section>

                            <section id="user-accounts" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">3. User Accounts</h2>
                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">3.1 Account Creation</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    To use certain features, you must create an account. You agree to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li>Provide accurate and complete information</li>
                                    <li>Maintain the security of your account credentials</li>
                                    <li>Notify us immediately of any unauthorized access</li>
                                    <li>Be responsible for all activities under your account</li>
                                </ul>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">3.2 Eligibility</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    You must be at least 13 years old to use our Service. If you are under 18, you must have parental consent.
                                </p>
                            </section>

                            <section id="subscription" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">4. Subscription and Payments</h2>
                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">4.1 Pricing Plans</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    We offer three subscription tiers:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li><strong>Free Plan:</strong> Basic access to limited features</li>
                                    <li><strong>Pro Plan (₹259/month):</strong> Full access to all features</li>
                                    <li><strong>Pro Plus Plan (₹599/month):</strong> Premium features and priority support</li>
                                </ul>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">4.2 Payment Terms</h3>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li>Payments are processed securely through Razorpay</li>
                                    <li>Subscriptions renew automatically unless cancelled</li>
                                    <li>All fees are in Indian Rupees (INR) and are non-refundable except as required by law</li>
                                    <li>We reserve the right to change pricing with 30 days' notice</li>
                                </ul>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">4.3 Cancellation</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period. You will retain access to paid features until then.
                                </p>
                            </section>

                            <section id="acceptable-use" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">5. Acceptable Use</h2>
                                <p className="text-slate-600 leading-relaxed mb-3">You agree NOT to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li>Use the Service for any illegal or unauthorized purpose</li>
                                    <li>Violate any laws or regulations</li>
                                    <li>Infringe on intellectual property rights</li>
                                    <li>Upload malicious code or viruses</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Scrape, copy, or redistribute our content without permission</li>
                                    <li>Use the Service to spam or harass others</li>
                                    <li>Resell or redistribute our AI-generated content as your own service</li>
                                </ul>
                            </section>

                            <section id="ip" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">6. Intellectual Property</h2>
                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">6.1 Our Content</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    All content on the platform, including text, graphics, logos, and software, is owned by HubSnap or our licensors and is protected by copyright and trademark laws.
                                </p>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">6.2 Your Content</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    You retain ownership of content you create using our Service. By using our Service, you grant us a license to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li>Store and process your content to provide the Service</li>
                                    <li>Use anonymized data to improve our AI models</li>
                                    <li>Display your content within the platform for your use</li>
                                </ul>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">6.3 AI-Generated Content</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Content generated by our AI tools is provided for your personal or commercial use. However, we do not guarantee the originality or copyright status of AI-generated content. You are responsible for ensuring compliance with copyright laws when using AI-generated content.
                                </p>
                            </section>

                            <section id="disclaimers" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">7. Disclaimers and Limitations</h2>
                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">7.1 No Income Guarantees</h3>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
                                    <p className="text-amber-900 font-semibold flex items-center gap-2">
                                        <span className="text-xl">⚠️</span> IMPORTANT: We do not guarantee any specific income, results, or success. Your results depend on your effort, consistency, market conditions, and many other factors beyond our control.
                                    </p>
                                </div>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">7.2 Service "As Is"</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    The Service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li>Uninterrupted or error-free service</li>
                                    <li>Accuracy or reliability of AI-generated content</li>
                                    <li>That the Service will meet your specific requirements</li>
                                    <li>That defects will be corrected</li>
                                </ul>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">7.3 Limitation of Liability</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    To the maximum extent permitted by law, HubSnap shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from your use of the Service.
                                </p>
                            </section>

                            <section id="third-party" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">8. Third-Party Services</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Our Service integrates with third-party services (Firebase, Razorpay, NVIDIA API). We are not responsible for the availability, accuracy, or content of these third-party services. Your use of third-party services is subject to their respective terms and policies.
                                </p>
                            </section>

                            <section id="termination" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">9. Termination</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We reserve the right to suspend or terminate your account at any time for:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li>Violation of these Terms</li>
                                    <li>Fraudulent or illegal activity</li>
                                    <li>Non-payment of fees</li>
                                    <li>Any reason at our sole discretion</li>
                                </ul>
                                <p className="text-slate-600 leading-relaxed mt-3">
                                    Upon termination, your right to use the Service will immediately cease. We may delete your data after 30 days of account termination.
                                </p>
                            </section>

                            <section id="indemnification" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">10. Indemnification</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    You agree to indemnify and hold harmless HubSnap, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li>Your use of the Service</li>
                                    <li>Your violation of these Terms</li>
                                    <li>Your violation of any rights of another party</li>
                                </ul>
                            </section>

                            <section id="governing-law" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">11. Governing Law</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
                                </p>
                            </section>

                            <section id="changes" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">12. Changes to Terms</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We reserve the right to modify these Terms at any time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of the Service after changes constitutes acceptance of the updated Terms.
                                </p>
                            </section>

                            <section id="contact" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">13. Contact Information</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you have questions about these Terms, please contact us:
                                </p>
                                <div className="mt-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <p className="mb-2"><strong>Email:</strong> <a href="mailto:legal@hubsnap.com" className="text-primary hover:underline">legal@hubsnap.com</a></p>
                                    <p><strong>Support:</strong> <a href="mailto:support@hubsnap.com" className="text-primary hover:underline">support@hubsnap.com</a></p>
                                </div>
                            </section>

                            <section className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-8">
                                <p className="text-sm text-slate-600">
                                    By using Creator OS, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                                </p>
                            </section>
                        </article>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}

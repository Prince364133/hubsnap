"use client";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { TableOfContents } from "@/components/legal/TableOfContents";

const privacyItems = [
    { id: "introduction", title: "1. Introduction" },
    { id: "information-collection", title: "2. Information We Collect" },
    { id: "use-of-information", title: "3. How We Use Your Information" },
    { id: "data-sharing", title: "4. Data Sharing and Disclosure" },
    { id: "data-security", title: "5. Data Security" },
    { id: "your-rights", title: "6. Your Rights" },
    { id: "data-retention", title: "7. Data Retention" },
    { id: "childrens-privacy", title: "8. Children's Privacy" },
    { id: "international-transfers", title: "9. International Data Transfers" },
    { id: "cookies", title: "10. Cookies and Tracking" },
    { id: "changes", title: "11. Changes to This Policy" },
    { id: "contact", title: "12. Contact Us" },
];

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <PublicHeader />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
                        <p className="text-slate-500">Last updated: February 9, 2026</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 relative items-start">
                        {/* Sidebar */}
                        <aside className="hidden lg:block lg:w-1/4 sticky top-32">
                            <TableOfContents items={privacyItems} />
                        </aside>

                        {/* Main Content */}
                        <article className="lg:w-3/4 prose prose-slate max-w-none bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                            <section id="introduction" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Introduction</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Welcome to HubSnap ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our Creator OS platform.
                                </p>
                            </section>

                            <section id="information-collection" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">2. Information We Collect</h2>
                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">2.1 Information You Provide</h3>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li><strong>Account Information:</strong> Name, email address, password when you create an account</li>
                                    <li><strong>Profile Information:</strong> Education, occupation, location, and other optional profile details</li>
                                    <li><strong>Payment Information:</strong> Billing details processed securely through Razorpay (we do not store credit card information)</li>
                                    <li><strong>Content:</strong> Channel ideas, content plans, saved tools, and other data you create using our platform</li>
                                </ul>

                                <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-800">2.2 Automatically Collected Information</h3>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
                                    <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                                    <li><strong>Cookies:</strong> We use cookies to maintain your session and improve user experience</li>
                                </ul>
                            </section>

                            <section id="use-of-information" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">3. How We Use Your Information</h2>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li>Provide and maintain our services</li>
                                    <li>Process payments and manage subscriptions</li>
                                    <li>Generate AI-powered content and recommendations</li>
                                    <li>Send important updates about your account and our services</li>
                                    <li>Improve our platform based on usage patterns</li>
                                    <li>Prevent fraud and ensure platform security</li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </section>

                            <section id="data-sharing" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">4. Data Sharing and Disclosure</h2>
                                <p className="text-slate-600 leading-relaxed mb-3">
                                    We do not sell your personal information. We may share your data only in the following circumstances:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li><strong>Service Providers:</strong> Firebase (Google), Razorpay, and NVIDIA API for essential platform functionality</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                                    <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                                </ul>
                            </section>

                            <section id="data-security" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">5. Data Security</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We implement industry-standard security measures to protect your data:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3 marker:text-primary">
                                    <li>Encryption of data in transit and at rest</li>
                                    <li>Secure authentication through Firebase</li>
                                    <li>Regular security audits and updates</li>
                                    <li>Access controls and monitoring</li>
                                </ul>
                                <p className="text-slate-600 leading-relaxed mt-3">
                                    However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                                </p>
                            </section>

                            <section id="your-rights" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">6. Your Rights</h2>
                                <p className="text-slate-600 leading-relaxed mb-3">You have the right to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                                    <li><strong>Export:</strong> Download your data in a portable format</li>
                                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                                    <li><strong>Object:</strong> Object to certain data processing activities</li>
                                </ul>
                                <p className="text-slate-600 leading-relaxed mt-3">
                                    To exercise these rights, contact us at <a href="mailto:privacy@hubsnap.com" className="text-primary hover:underline font-medium">privacy@hubsnap.com</a>
                                </p>
                            </section>

                            <section id="data-retention" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">7. Data Retention</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We retain your personal data only as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your data within 30 days, except where we are required to retain it by law.
                                </p>
                            </section>

                            <section id="childrens-privacy" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">8. Children's Privacy</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Our services are not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
                                </p>
                            </section>

                            <section id="international-transfers" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">9. International Data Transfers</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Your data may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
                                </p>
                            </section>

                            <section id="cookies" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">10. Cookies and Tracking</h2>
                                <p className="text-slate-600 leading-relaxed mb-3">We use cookies and similar technologies to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-primary">
                                    <li>Keep you signed in</li>
                                    <li>Remember your preferences</li>
                                    <li>Analyze platform usage</li>
                                    <li>Improve user experience</li>
                                </ul>
                                <p className="text-slate-600 leading-relaxed mt-3">
                                    You can control cookies through your browser settings, but disabling them may affect platform functionality.
                                </p>
                            </section>

                            <section id="changes" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">11. Changes to This Policy</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We may update this privacy policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of our services after changes constitutes acceptance of the updated policy.
                                </p>
                            </section>

                            <section id="contact" className="scroll-mt-32">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">12. Contact Us</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you have questions about this privacy policy or our data practices, please contact us:
                                </p>
                                <div className="mt-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <p className="mb-2"><strong>Email:</strong> <a href="mailto:privacy@hubsnap.com" className="text-primary hover:underline">privacy@hubsnap.com</a></p>
                                    <p><strong>Support:</strong> <a href="mailto:support@hubsnap.com" className="text-primary hover:underline">support@hubsnap.com</a></p>
                                </div>
                            </section>
                        </article>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}

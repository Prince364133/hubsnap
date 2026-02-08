import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <Sidebar />
            <div className="flex-1 pl-[240px]">
                {/* Note: Header is sticky inside the main content area or fixed? 
             Design says "Top Header (Sticky)". 
             If Sidebar is fixed left, Header usually sits next to it.
             The sidebar component has "fixed left-0 top-0 h-screen". 
             So the main content div needs pl-[240px].
             And Header should be inside this div, sticky to top.
         */}
                <Header />
                <main className="mx-auto max-w-[1200px] p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

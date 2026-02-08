import { BackToTop } from "@/components/ui/BackToTop";

export function PublicFooter() {
    return (
        <>
            <footer className="py-12 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-400">
                    © 2026 HubSnap. Empowering the next generation of digital creators.
                </div>
            </footer>
            <BackToTop />
        </>
    );
}

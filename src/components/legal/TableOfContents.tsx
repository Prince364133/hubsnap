"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
    items: {
        id: string;
        title: string;
    }[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -66% 0px" }
        );

        items.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [items]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Adjust for sticky header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
            setActiveId(id);
        }
    };

    return (
        <nav className="sticky top-32 space-y-2 hidden lg:block">
            <p className="font-semibold mb-4 text-sm text-slate-900 uppercase tracking-wider">
                On this page
            </p>
            <ul className="space-y-2 text-sm border-l-2 border-slate-100">
                {items.map((item) => (
                    <li key={item.id} className="relative">
                        <a
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            className={cn(
                                "block pl-4 py-1 transition-colors duration-200 border-l-2 -ml-[2px]",
                                activeId === item.id
                                    ? "border-primary text-primary font-medium"
                                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                            )}
                        >
                            {item.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

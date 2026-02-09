import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
    threshold?: number;
    rootMargin?: string;
}

export function useInfiniteScroll(
    callback: () => void,
    options: UseInfiniteScrollOptions = {}
) {
    const { threshold = 0.1, rootMargin = '100px' } = options;
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef<HTMLDivElement>(null);

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            setIsIntersecting(entry.isIntersecting);

            if (entry.isIntersecting) {
                callback();
            }
        },
        [callback]
    );

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(handleIntersection, {
            threshold,
            rootMargin,
        });

        observer.observe(target);

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, [handleIntersection, threshold, rootMargin]);

    return { targetRef, isIntersecting };
}

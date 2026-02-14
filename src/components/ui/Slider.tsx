"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
    value: number[];
    min: number;
    max: number;
    step: number;
    onValueChange: (value: number[]) => void;
    className?: string;
}

export function Slider({ value, min, max, step, onValueChange, className }: SliderProps) {
    const currentValue = value[0];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange([parseFloat(e.target.value)]);
    };

    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
            <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                    className="absolute h-full bg-primary"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={currentValue}
                onChange={handleChange}
                className="absolute w-full h-full opacity-0 cursor-pointer"
            />
            <div
                className="absolute h-5 w-5 rounded-full border-2 border-primary bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 pointer-events-none"
                style={{ left: `calc(${percentage}% - 10px)` }}
            />
        </div>
    );
}

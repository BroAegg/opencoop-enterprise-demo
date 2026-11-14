import React from 'react';

const sizeMap = {
    sm: { container: "w-7 h-7 rounded-md", icon: "w-4 h-4" },
    md: { container: "w-9 h-9 rounded-lg", icon: "w-4 h-4" },
    lg: { container: "w-11 h-11 rounded-xl", icon: "w-5 h-5" },
    xl: { container: "w-14 h-14 rounded-2xl", icon: "w-6 h-6" },
};

const colorMap = {
    slate: "bg-slate-500",
    gray: "bg-gray-500",
    zinc: "bg-zinc-500",
    neutral: "bg-neutral-500",
    stone: "bg-stone-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    lime: "bg-lime-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    sky: "bg-sky-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    purple: "bg-purple-500",
    fuchsia: "bg-fuchsia-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    primary: "bg-primary",
    dark: "bg-slate-800",
};

export default function AppIcon({ 
    icon: Icon, 
    color = "slate", 
    size = "lg", 
    className = "" 
}) {
    if (!Icon) return null;

    const sizeClasses = sizeMap[size] || sizeMap.lg;
    const bgClass = colorMap[color] || colorMap.slate;

    return (
        <div className={`${sizeClasses.container} flex items-center justify-center shrink-0 ${bgClass} shadow-sm text-white ${className}`}>
            <Icon className={sizeClasses.icon} strokeWidth={2} />
        </div>
    );
}


import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import AppIcon from './AppIcon';

export default function InsetListItem({ 
    icon: Icon, 
    title, 
    subtitle, 
    action, // Can be a custom component (like a status badge)
    href, 
    onClick,
    isLast = false,
    iconColor = 'slate',
    iconBgClass, // Legacy
    iconColorClass, // Legacy
    external = false,
    target,
    rel,
    children
}) {
    const Component = (external || target) ? 'a' : (href ? Link : (onClick ? 'button' : 'div'));
    const isInteractive = href || onClick;

    return (
        <Component 
            href={href}
            onClick={onClick}
            target={target}
            rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
            className={`w-full text-left block relative group ${
                isInteractive ? 'hover:bg-slate-50/80 transition-colors cursor-pointer' : ''
            }`}
        >
            <div className="flex items-center justify-between p-4 w-full">
            {/* Inner Border (Apple Style, indented after icon) */}
            {!isLast && (
                <div className="absolute bottom-0 right-0 left-[72px] h-px bg-slate-100 group-hover:bg-transparent transition-colors"></div>
            )}

            <div className="flex items-center gap-4">
                {Icon && (
                    iconBgClass || iconColorClass ? (
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass || 'bg-slate-100'} ${iconColorClass || 'text-slate-600'}`}>
                            <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                    ) : (
                        <AppIcon icon={Icon} color={iconColor} size="lg" />
                    )
                )}
                
                <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-slate-900 tracking-tight">
                        {title}
                    </span>
                    {subtitle && (
                        <span className="text-[13px] text-slate-500 mt-0.5">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
                {children}
                
                {action}
                
                {isInteractive && !action && (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                )}
            </div>
            </div>
        </Component>
    );
}


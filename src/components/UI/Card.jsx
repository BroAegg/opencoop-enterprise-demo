import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ 
    children, 
    className = '', 
    dark = false,
    variant = 'light',
    hover = false,
    animate = false,
    innerPadding = "p-3", // Revio uses outer p-3 and inner p-5
    ...props 
}) {
    // Resolve legacy 'dark' prop to variant
    const resolvedVariant = dark ? 'dark' : variant;

    // Revio-inspired ultra-rounded card with deep soft shadows and inner white highlight
    const lightClasses = `bg-white border border-slate-100 shadow-ambient ${
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-ambient-lg' : ''
    }`;
    
    // Dark variant adapted to Manasuka (primary color)
    const darkClasses = `bg-primary border border-white/10 shadow-ambient ${
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-ambient-lg hover:border-white/20' : ''
    }`;

    // Apple HIG Glassmorphism variant
    const glassClasses = `material-regular border border-slate-200/60 shadow-ambient ${
        hover ? 'transition-all duration-300 hover:bg-white/90 hover:-translate-y-0.5' : ''
    }`;

    let baseClass = lightClasses;
    if (resolvedVariant === 'dark') baseClass = darkClasses;
    if (resolvedVariant === 'glass') baseClass = glassClasses;

    // Note: the `group` class allows inner elements to react to the card being hovered
    const finalClass = `group relative overflow-hidden ${
        resolvedVariant === 'glass' ? 'rounded-3xl' : 'rounded-2xl'
    } ${innerPadding} ${baseClass} ${className}`;

    if (animate) {
        return (
            <motion.div 
                className={finalClass}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={finalClass} {...props}>
            {children}
        </div>
    );
}


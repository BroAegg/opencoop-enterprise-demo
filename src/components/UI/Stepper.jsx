import React from 'react';

export default function Stepper({ 
    currentStep, 
    totalSteps, 
    title, 
    className = "" 
}) {
    // Generate array of step numbers [1, 2, ..., totalSteps]
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
    
    // Calculate percentage based on current step
    const percentage = Math.round((currentStep / totalSteps) * 100);

    return (
        <div className={`mb-7 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500">
                    Langkah {currentStep} dari {totalSteps} {title ? `• ${title}` : ''}
                </span>
                <span className="text-[11px] font-mono font-bold text-primary">
                    {percentage}%
                </span>
            </div>
            <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
                {steps.map((stepNum) => (
                    <div 
                        key={stepNum} 
                        className={`h-1.5 rounded-full transition-colors duration-300 ${
                            stepNum <= currentStep ? 'bg-primary' : 'bg-slate-100'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}


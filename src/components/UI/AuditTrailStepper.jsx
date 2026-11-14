import React from 'react';
import { Check, Clock, RotateCcw, X } from 'lucide-react';

/**
 * AuditTrailStepper
 * Industrial ERP Multi-level Approval & Audit Timeline.
 * Rantai persetujuan berjenjang untuk otorisasi transaksi koperasi.
 */
export default function AuditTrailStepper({ steps = [], className = "" }) {
    if (!steps || steps.length === 0) return null;

    return (
        <div className={`space-y-5 sm:space-y-6 ${className}`}>
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isRevision = step.status === 'revision' || step.status === 'revision_needed';
                const isRejected = step.status === 'rejected';

                let nodeContent = (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center font-mono text-[11px] sm:text-xs font-bold">
                        {index + 1}
                    </div>
                );

                if (isCompleted) {
                    nodeContent = (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs border border-emerald-700/20">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </div>
                    );
                } else if (isRevision) {
                    nodeContent = (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs border border-amber-600/30 ring-3 sm:ring-4 ring-amber-400/20">
                            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </div>
                    );
                } else if (isRejected) {
                    nodeContent = (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs border border-rose-700/20">
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </div>
                    );
                } else if (isCurrent) {
                    nodeContent = (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border border-amber-500/30 ring-3 sm:ring-4 ring-amber-400/20">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] motion-safe:animate-pulse motion-reduce:animate-none" />
                        </div>
                    );
                }

                return (
                    <div key={step.id || index} className="relative flex items-start gap-3 sm:gap-4">
                        {/* Connecting Line */}
                        {!isLast && (
                            <div
                                className={`absolute left-3.5 sm:left-4 top-7 sm:top-8 -bottom-5 sm:-bottom-6 w-0.5 ${
                                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                            />
                        )}

                        {/* Step Icon Node */}
                        <div className="relative z-10 shrink-0">
                            {nodeContent}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-1 mb-1">
                                <h4 className={`text-xs sm:text-sm font-bold tracking-tight ${
                                    isRevision ? 'text-amber-900' : isRejected ? 'text-rose-900' : isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                                }`}>
                                    {step.title}
                                </h4>
                                {step.timestamp && (
                                    <span className="text-[10.5px] sm:text-[11px] font-mono text-slate-400">
                                        {step.timestamp}
                                    </span>
                                )}
                            </div>

                            {step.actor && (
                                <p className="text-[11px] sm:text-[11.5px] text-slate-500 mb-1 font-medium">
                                    {step.actor}
                                </p>
                            )}

                            {step.note && (
                                <div className={`mt-1.5 sm:mt-2 p-2.5 sm:p-3 rounded-xl border text-[11.5px] sm:text-xs font-normal leading-relaxed ${
                                    isRevision ? 'bg-amber-50/80 border-amber-200 text-amber-950' : isRejected ? 'bg-rose-50/80 border-rose-200 text-rose-950' : 'bg-slate-50 border-slate-200/70 text-slate-700'
                                }`}>
                                    "{step.note}"
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


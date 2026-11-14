import React from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * TactileProgressBar
 * 
 * Apple HIG tactile progress meter with a recessed track groove,
 * diagonal striped pattern, physical rounded fill, and a 3D circular thumb handle.
 */
export default function TactileProgressBar({
    current = 0,
    target = 100,
    height = 'h-9 sm:h-10',
    barGradient = 'bg-gradient-to-r from-[#1F6376] to-[#2dd4bf]',
    texturedTrack = true,
    showHandle = true,
    className = '',
}) {
    const percentage = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;

    return (
        <div
            className={`w-full ${height} bg-slate-200/80 rounded-full relative overflow-hidden flex items-center border border-slate-300/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(255,255,255,0.7)] ${className}`}
        >
            {/* Recessed textured pattern for groove background */}
            {texturedTrack && (
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTS0xLDEgTDEsLTEgTTEwLDBMMCwxMCBNOSwxMSBMMTEsOSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+")`,
                    }}
                />
            )}

            {/* Filled bar with physical specular highlight & smooth transition */}
            <div
                className={`h-full ${barGradient} rounded-full relative z-10 flex items-center justify-end pr-1 sm:pr-1.5 transition-all duration-1000 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_8px_rgba(31,99,118,0.3)]`}
                style={{
                    width: `${Math.max(percentage, percentage > 0 ? 8 : 0)}%`,
                    minWidth: percentage > 0 ? '2.5rem' : '0',
                }}
            >
                {/* 3D Circular Thumb Handle */}
                {showHandle && percentage > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="h-5 sm:h-6 w-0.5 bg-white/30 rounded-full"></div>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] border border-slate-200/50 cursor-grab active:cursor-grabbing">
                            <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


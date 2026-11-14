import React from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    Clock,
    Compass,
    Home,
    Lock,
    LogIn,
    RefreshCw,
    ServerCrash,
    ShieldAlert,
    WifiOff,
    Wrench,
} from 'lucide-react';
import TactileCard from '@/Components/UI/TactileCard';
import Button from '@/Components/UI/Button';
import StatusBadge from '@/Components/UI/StatusBadge';
import TactileCallout from '@/Components/UI/TactileCallout';
import { getErrorMeta } from './errorPageCatalog';

const ICON_MAP = {
    401: Lock,
    403: ShieldAlert,
    404: Compass,
    419: Clock,
    429: AlertTriangle,
    500: ServerCrash,
    502: WifiOff,
    503: Wrench,
    504: Clock,
    505: AlertTriangle,
};

const TONE_BADGE_MAP = {
    teal: 'bg-[#1F6376] text-white border-teal-600/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(31,99,118,0.28)]',
    amber: 'bg-amber-400 text-slate-950 border-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_4px_12px_rgba(217,119,6,0.28)]',
    rose: 'bg-rose-600 text-white border-rose-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(225,29,72,0.28)]',
    slate: 'bg-slate-800 text-white border-slate-700/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_12px_rgba(15,23,42,0.22)]',
};

/**
 * TactileErrorView
 *
 * Reusable Apple HIG Tactile 3D error state presentation for Manasuka.
 * Shared across live HTTP error pages and the /component Showcase gallery.
 */
export default function TactileErrorView({
    status = 404,
    homeUrl = '/',
    requestPath = null,
    embedded = false,
    onRetry = null,
}) {
    const meta = getErrorMeta(status);
    const Icon = ICON_MAP[meta.status] || AlertTriangle;
    const iconBadgeClasses = TONE_BADGE_MAP[meta.tone] || TONE_BADGE_MAP.slate;

    const handleBack = () => {
        if (embedded) return;
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = homeUrl;
        }
    };

    const handleReload = () => {
        if (onRetry) {
            onRetry();
            return;
        }
        if (embedded) return;
        window.location.reload();
    };

    const renderPrimaryAction = () => {
        if (meta.primaryAction === 'login') {
            return (
                <Button
                    href={embedded ? undefined : '/login'}
                    onClick={embedded ? handleReload : undefined}
                    variant="primary"
                    size="md"
                    icon={LogIn}
                    responsive
                >
                    Masuk ke Akun
                </Button>
            );
        }

        if (meta.primaryAction === 'reload') {
            return (
                <Button
                    variant="primary"
                    size="md"
                    icon={RefreshCw}
                    onClick={handleReload}
                    responsive
                >
                    Muat Ulang Halaman
                </Button>
            );
        }

        return (
            <Button
                href={embedded ? undefined : homeUrl}
                onClick={embedded ? handleReload : undefined}
                variant="primary"
                size="md"
                icon={Home}
                responsive
            >
                Ke Beranda
            </Button>
        );
    };

    return (
        <div className={embedded ? 'w-full max-w-2xl mx-auto' : 'w-full max-w-xl mx-auto px-4'}>
            <TactileCard variant="white" rounded="squircle" className="p-6 sm:p-8">
                {/* Brand & HTTP Code Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/logo.png"
                            alt="Manasuka"
                            className="w-6 h-6 object-contain brightness-0 shrink-0"
                        />
                        <span className="text-sm font-medium tracking-tight text-slate-900">
                            Koperasi Manasuka
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatusBadge status={meta.badgeStatus} variant="tactile" dot>
                            HTTP {meta.status}
                        </StatusBadge>
                        <span className="hidden sm:inline-block text-[10px] font-mono font-bold tracking-wider text-slate-400">
                            {meta.codeLabel}
                        </span>
                    </div>
                </div>

                {/* Recessed Physical Well + Giant Monospace Status Code */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                    <div className="w-18 h-18 rounded-3xl bg-[#F2F3F5] border border-slate-200/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(255,255,255,0.75)] flex items-center justify-center shrink-0">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${iconBadgeClasses}`}>
                            <Icon className="w-6 h-6" strokeWidth={2} />
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-slate-900 leading-none mb-2">
                            {meta.status}
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                            {meta.title}
                        </h1>
                    </div>
                </div>

                {/* Human-friendly description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {meta.description}
                </p>

                {/* Optional Path Pill */}
                {requestPath && (
                    <div className="mb-5 px-3 py-2 rounded-xl bg-[#F8F9FA] border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0">
                            Path
                        </span>
                        <code className="font-mono text-slate-700 truncate">
                            {requestPath}
                        </code>
                    </div>
                )}

                {/* Guidance Callout */}
                <TactileCallout
                    variant={meta.calloutVariant}
                    title="Panduan Pemulihan"
                    message={meta.hint}
                    className="mb-6"
                />

                {/* Action Footer */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-5 border-t border-slate-100">
                    <Button
                        variant="secondary"
                        size="md"
                        icon={ArrowLeft}
                        onClick={handleBack}
                        responsive
                    >
                        Kembali
                    </Button>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        {meta.primaryAction === 'reload' && (
                            <Button
                                href={embedded ? undefined : homeUrl}
                                onClick={embedded ? handleBack : undefined}
                                variant="ghost"
                                size="md"
                                icon={Home}
                                responsive
                            >
                                Ke Beranda
                            </Button>
                        )}
                        {renderPrimaryAction()}
                    </div>
                </div>
            </TactileCard>
        </div>
    );
}


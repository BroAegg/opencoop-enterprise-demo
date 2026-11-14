import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
            <div className="hidden sm:block text-sm text-slate-500">
                Menampilkan halaman yang berisi data anggota
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
                {links.map((link, key) => {
                    if (link.url === null) {
                        return (
                            <div
                                key={key}
                                className="px-3 py-1.5 text-sm text-slate-400 bg-slate-50 border border-slate-100 rounded-xl cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    // Secara global (global function), kita inject current query string ke setiap link
                    // Jadi backend tidak perlu capek-capek nulis ->withQueryString() lagi!
                    let finalUrl = link.url;
                    try {
                        // link.url bawaan backend biasanya: "http://domain.com/path?page=2"
                        const urlObj = new URL(link.url, window.location.origin);
                        const currentParams = new URLSearchParams(window.location.search);
                        
                        // Timpa param dari current URL (filter) ke url pagination, KECUALI param 'page'
                        for (const [key, value] of currentParams.entries()) {
                            if (key !== 'page' && !urlObj.searchParams.has(key)) {
                                urlObj.searchParams.set(key, value);
                            }
                        }
                        // Ambil path + query nya saja (relatif) biar rapi di Inertia
                        finalUrl = urlObj.pathname + urlObj.search;
                    } catch (e) {
                        console.error('Pagination URL parsing error', e);
                    }

                    return (
                        <Link
                            key={key}
                            href={finalUrl}
                            className={`px-3 py-1.5 text-sm rounded-xl border transition-all ${
                                link.active 
                                    ? 'bg-primary text-white border-primary shadow-[0_4px_12px_rgba(31,99,118,0.2)]' 
                                    : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}


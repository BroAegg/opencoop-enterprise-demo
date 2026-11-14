import React, { useState, useEffect, useCallback } from 'react';
import { 
    Printer, X, CheckCircle2, AlertCircle, RefreshCw, Zap, Cable, Bluetooth, 
    Scan, HelpCircle, Laptop, Usb, Check, ChevronRight
} from 'lucide-react';
import { thermalPrinter } from '@/Utils/thermalPrinterDriver';
import { toast } from '@/Components/UI/Toast';

export default function PosHardwareSettingsModal({ isOpen, onClose }) {
    const [status, setStatus] = useState(thermalPrinter.getStatus());
    const [isConnecting, setIsConnecting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isScanningUsb, setIsScanningUsb] = useState(false);
    const [usbDevices, setUsbDevices] = useState([]);
    const [diagnosticLog, setDiagnosticLog] = useState([]);

    const addLog = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setDiagnosticLog((prev) => [{ time, msg, type }, ...prev.slice(0, 15)]);
    };

    const scanUsbDevices = useCallback(async () => {
        if (!status.isNative) return;
        setIsScanningUsb(true);
        try {
            const list = await thermalPrinter.listUsbDevices();
            setUsbDevices(list || []);
            if (list.length > 0) {
                addLog(`Ditemukan ${list.length} perangkat USB di tablet / USB Hub.`, 'success');
            } else {
                addLog('Tidak ada perangkat USB terdeteksi di port OTG.', 'warning');
            }
        } catch (err) {
            addLog(`Gagal memindai USB: ${err.message}`, 'error');
        } finally {
            setIsScanningUsb(false);
        }
    }, [status.isNative]);

    useEffect(() => {
        const unsubscribe = thermalPrinter.subscribe((newStatus) => {
            setStatus(newStatus);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setStatus(thermalPrinter.getStatus());
            if (status.isNative && status.connectionMode === 'USB') {
                scanUsbDevices();
            }
        }
    }, [isOpen, status.isNative, status.connectionMode, scanUsbDevices]);

    if (!isOpen) return null;

    const handleConnect = async (deviceId = null) => {
        setIsConnecting(true);
        addLog(`Mencoba menghubungkan ke printer ${deviceId ? `(ID: ${deviceId})` : ''}...`, 'info');
        try {
            const res = await thermalPrinter.requestConnect(deviceId);
            const mode = status.isNative 
                ? (status.connectionMode === 'USB' ? 'USB Eppos' : 'Bluetooth') 
                : 'USB/Serial';
            addLog(`Printer ${mode} BERHASIL terhubung! Siap mencetak.`, 'success');
            toast.success(`Printer ${mode} berhasil terhubung!`);
            scanUsbDevices();
        } catch (err) {
            addLog(`Gagal konek: ${err.message || err}`, 'error');
            if (err.name !== 'NotFoundError') {
                toast.error(err.message || 'Gagal menghubungkan printer.');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        await thermalPrinter.disconnect();
        addLog('Koneksi printer telah diputus.', 'info');
        toast.info('Koneksi printer thermal diputus.');
        scanUsbDevices();
    };

    const handleTestPrint = async () => {
        setIsTesting(true);
        addLog('Mengirim data uji cetak ESC/POS...', 'info');
        try {
            await thermalPrinter.testPrint({ name: 'KOPERASI Manasuka' });
            addLog('Uji cetak berhasil dikirim ke printer!', 'success');
            toast.success('Uji cetak berhasil dikirim ke printer!');
        } catch (err) {
            addLog(`Gagal mencetak: ${err.message || err}`, 'error');
            toast.error(err.message || 'Gagal mengirim uji cetak ke printer.');
        } finally {
            setIsTesting(false);
        }
    };

    const handleKickDrawer = async () => {
        addLog('Mengirim pulsa sinyal buka laci kas...', 'info');
        try {
            await thermalPrinter.kickCashDrawer();
            addLog('Laci kas berhasil dibuka!', 'success');
            toast.success('Sinyal buka laci kas berhasil dikirim.');
        } catch (err) {
            addLog(`Gagal buka laci kas: ${err.message || err}`, 'error');
            toast.error(err.message || 'Gagal membuka laci kas.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                            status.isConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Perangkat Kasir & Printer</h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    status.isConnected 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    {status.isConnected ? 'TERHUBUNG' : 'TERPUTUS'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Direct ESC/POS Thermal Printing (Eppos USB & Bluetooth)</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Tutup (Esc)"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                    {/* Tablet Connection Mode Selector */}
                    {status.isNative && (
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Tipe Koneksi Printer
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        thermalPrinter.setConnectionMode('USB');
                                        scanUsbDevices();
                                    }}
                                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                                        status.connectionMode === 'USB'
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Cable className="w-4 h-4" />
                                        <p className="font-bold text-xs">Kabel USB / Hub</p>
                                    </div>
                                    <p className={`text-[10px] mt-1 ${status.connectionMode === 'USB' ? 'text-slate-300' : 'text-slate-500'}`}>
                                        Printer Eppos via USB Hub / OTG (Rekomendasi)
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        thermalPrinter.setConnectionMode('BLUETOOTH');
                                    }}
                                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                                        status.connectionMode === 'BLUETOOTH'
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Bluetooth className="w-4 h-4" />
                                        <p className="font-bold text-xs">Bluetooth SPP</p>
                                    </div>
                                    <p className={`text-[10px] mt-1 ${status.connectionMode === 'BLUETOOTH' ? 'text-slate-300' : 'text-slate-500'}`}>
                                        Nirkabel Bluetooth Thermal Printer
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Live Connection Banner */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        status.isConnected 
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${
                                status.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                            <div>
                                <p className="text-sm font-bold leading-tight">
                                    {status.isConnected 
                                        ? `Printer Siap: ${status.savedName || 'Eppos Thermal Printer'}`
                                        : 'Printer Belum Terhubung'}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                    {status.isConnected
                                        ? `Koneksi aktif (${status.paperWidth}) · Struk kasir dicetak langsung tanpa popup`
                                        : (status.isNative
                                            ? (status.connectionMode === 'USB'
                                                ? 'Pilih perangkat di daftar USB Hub di bawah atau sentuh Hubungkan'
                                                : 'Sentuh tombol Pilih Bluetooth untuk memasangkan printer')
                                            : 'Pilih port WebSerial untuk komputer desktop')}
                                </p>
                            </div>
                        </div>
                        {status.isConnected ? (
                            <button
                                type="button"
                                onClick={handleDisconnect}
                                className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors shadow-2xs shrink-0 ml-3"
                            >
                                Putuskan
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleConnect()}
                                disabled={isConnecting}
                                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0 ml-3 flex items-center gap-1.5"
                            >
                                {isConnecting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                <span>{isConnecting ? 'Menyambung...' : (status.isNative ? (status.connectionMode === 'USB' ? 'Hubungkan USB' : 'Pilih Bluetooth') : 'Hubungkan Port')}</span>
                            </button>
                        )}
                    </div>

                    {/* USB Inspector List (Only when in USB mode on tablet) */}
                    {status.isNative && status.connectionMode === 'USB' && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Usb className="w-4 h-4 text-slate-600" />
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Perangkat di USB Hub Tablet ({usbDevices.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={scanUsbDevices}
                                    disabled={isScanningUsb}
                                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isScanningUsb ? 'animate-spin' : ''}`} />
                                    <span>Pindai Ulang</span>
                                </button>
                            </div>

                            {usbDevices.length > 0 ? (
                                <div className="space-y-2">
                                    {usbDevices.map((dev) => (
                                        <div 
                                            key={dev.deviceId}
                                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                                dev.isConnected 
                                                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/20' 
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {dev.isPrinter ? (
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                        <Printer className="w-4 h-4" />
                                                    </div>
                                                ) : dev.isScanner ? (
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                                        <Scan className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                                        <Usb className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                        <span>{dev.name || 'Perangkat USB'}</span>
                                                        {dev.isPrinter && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                                                Printer
                                                            </span>
                                                        )}
                                                        {dev.isScanner && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                                                                Scanner Barcode
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                        VID: {dev.vendorId} · PID: {dev.productId} · ID: {dev.deviceId}
                                                        {dev.hasPermission ? ' · Izin: OK' : ' · Perlu Izin'}
                                                    </p>
                                                </div>
                                            </div>

                                            {dev.isConnected ? (
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                                                    <Check className="w-3.5 h-3.5" />
                                                    Aktif
                                                </span>
                                            ) : dev.isPrinter ? (
                                                <button
                                                    type="button"
                                                    disabled={isConnecting}
                                                    onClick={() => handleConnect(dev.deviceId)}
                                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-2xs disabled:opacity-50"
                                                >
                                                    Hubungkan
                                                </button>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-amber-800">
                                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                                        <span>Tidak Ada Perangkat USB Terdeteksi di USB Hub</span>
                                    </div>
                                    <ul className="list-disc list-inside text-[11px] text-amber-700 space-y-1 pl-1">
                                        <li>Pastikan adapter OTG / kabel USB Hub tertancap rapat ke tablet.</li>
                                        <li>Pastikan printer Eppos sudah dinyalakan (lampu power hijau/biru menyala).</li>
                                        <li>Untuk beberapa merk tablet (Oppo, Vivo, Realme), buka <strong>Settings Android &gt; Pengaturan Tambahan &gt; aktifkan "Koneksi OTG"</strong>.</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paper Width Selection */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Ukuran Kertas Thermal Struk
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => thermalPrinter.setPaperWidth('58mm')}
                                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                                    status.paperWidth === '58mm' 
                                        ? 'border-slate-900 bg-slate-100 text-slate-900 ring-1 ring-slate-900/10' 
                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                            >
                                <p className="font-bold text-sm text-slate-900">58 mm (32 Kolom)</p>
                                <p className="text-xs text-slate-500 mt-0.5">Standar Eppos 58mm Kasir</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => thermalPrinter.setPaperWidth('80mm')}
                                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                                    status.paperWidth === '80mm' 
                                        ? 'border-slate-900 bg-slate-100 text-slate-900 ring-1 ring-slate-900/10' 
                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                            >
                                <p className="font-bold text-sm text-slate-900">80 mm (48 Kolom)</p>
                                <p className="text-xs text-slate-500 mt-0.5">Struk Format Lebar 80mm</p>
                            </button>
                        </div>
                    </div>

                    {/* Auto Direct Print Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50">
                        <div>
                            <p className="text-xs font-bold text-slate-800">Cetak Otomatis Selesai Transaksi</p>
                            <p className="text-[11px] text-slate-500">Kirim struk langsung ke printer saat tombol bayar ditekan</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={status.autoPrintDirect}
                            onChange={(e) => thermalPrinter.setAutoPrintDirect(e.target.checked)}
                            className="w-5 h-5 rounded text-slate-900 focus:ring-slate-900/10 cursor-pointer accent-slate-900"
                        />
                    </div>

                    {/* Diagnostic Actions */}
                    <div className="pt-2 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={handleTestPrint}
                            disabled={!status.isConnected || isTesting}
                            className="flex-1 py-3 px-4 min-h-[46px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer active:scale-98 flex items-center justify-center gap-2 shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            {isTesting ? 'Mencetak Uji...' : 'Uji Cetak Struk (Test)'}
                        </button>
                        <button
                            type="button"
                            onClick={handleKickDrawer}
                            disabled={!status.isConnected}
                            className="flex-1 py-3 px-4 min-h-[46px] rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                        >
                            <Zap className="w-4 h-4 text-amber-600" />
                            Buka Laci Kas
                        </button>
                    </div>

                    {/* Diagnostic Logs Console */}
                    {diagnosticLog.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-200 p-3.5 space-y-1.5 font-mono text-[11px]">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans pb-1 border-b border-slate-800">
                                <span>LOG DIAGNOSTIK HARDWARE</span>
                                <button 
                                    type="button" 
                                    onClick={() => setDiagnosticLog([])} 
                                    className="hover:text-white cursor-pointer"
                                >
                                    Bersihkan
                                </button>
                            </div>
                            <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin">
                                {diagnosticLog.map((log, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                        <span className={
                                            log.type === 'error' ? 'text-rose-400' :
                                            log.type === 'success' ? 'text-emerald-400' :
                                            log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                                        }>
                                            {log.msg}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <span className="text-xs text-slate-500 font-medium">
                        {status.isConnected ? '✓ Siap melayani transaksi kasir' : '⚠️ Pastikan printer terhubung sebelum transaksi'}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    );
}


/**
 * thermalPrinterDriver.js: Hardware Driver for Direct ESC/POS Thermal Printing.
 * 
 * Supports three hardware connection channels:
 * 1. Android Native USB Host (Eppos, Xprinter, Panda via USB OTG cable or multi-port USB Hub)
 * 2. Android Native Bluetooth Classic (SPP)
 * 3. Desktop Web Browser (WebSerial API for Chrome / Edge)
 */

import { CMD, buildReceiptEscPos, buildTestReceiptEscPos, buildSupplierPayoutEscPos, buildSupplierCodPayoutEscPos, buildBatchSummaryEscPos, buildConsignmentMorningWorkflowEscPos } from './escpos';
import { bluetoothPrinter } from './BluetoothPrinterBridge';
import { usbPrinter } from './UsbPrinterBridge';

const getStorageItem = (key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null);
const setStorageItem = (key, val) => (typeof window !== 'undefined' ? localStorage.setItem(key, val) : undefined);

class ThermalPrinterDriver {
    constructor() {
        this.port = null;
        this.isConnected = false;
        this.paperWidth = getStorageItem('pos_printer_width') || '58mm';
        this.autoPrintDirect = getStorageItem('pos_printer_direct') !== 'false';
        this.baudRate = parseInt(getStorageItem('pos_printer_baud') || '9600', 10);
        // Default to USB on tablet since printers are commonly wired through USB Hub with barcode scanner
        this.connectionMode = getStorageItem('pos_printer_mode') || 'USB';
        this.listeners = new Set();

        if (this.isNative()) {
            if (this.connectionMode === 'USB') {
                this.isConnected = Boolean(usbPrinter?.isConnected);
            } else {
                this.isConnected = Boolean(bluetoothPrinter?.isConnected);
            }

            try {
                usbPrinter?.subscribe?.((st) => {
                    if (this.connectionMode === 'USB') {
                        this.isConnected = Boolean(st?.isConnected);
                        this.notify();
                    }
                });
            } catch (e) {
                console.warn('UsbPrinter subscribe skipped:', e);
            }

            try {
                bluetoothPrinter?.subscribe?.((st) => {
                    if (this.connectionMode === 'BLUETOOTH') {
                        this.isConnected = Boolean(st?.isConnected);
                        this.notify();
                    }
                });
            } catch (e) {
                console.warn('BluetoothPrinter subscribe skipped:', e);
            }
        }
    }

    isSupported() {
        if (this.isNative()) {
            return true;
        }
        return typeof navigator !== 'undefined' && Boolean(navigator.serial);
    }

    isNative() {
        return usbPrinter.isNative() || bluetoothPrinter.isNative();
    }

    setConnectionMode(mode) {
        this.connectionMode = mode;
        setStorageItem('pos_printer_mode', mode);
        this.notify();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify() {
        const state = this.getStatus();
        this.listeners.forEach((fn) => fn(state));
    }

    getStatus() {
        const isNat = this.isNative();
        let connected = this.isConnected;
        let device = null;
        let savedName = null;

        if (isNat) {
            if (this.connectionMode === 'USB') {
                connected = usbPrinter.isConnected;
                device = usbPrinter.connectedDevice;
                savedName = usbPrinter.savedName;
            } else {
                connected = bluetoothPrinter.isConnected;
                device = bluetoothPrinter.connectedDevice;
                savedName = bluetoothPrinter.savedName;
            }
        }

        return {
            isSupported: this.isSupported(),
            isNative: isNat,
            connectionMode: this.connectionMode,
            isConnected: connected,
            paperWidth: this.paperWidth,
            autoPrintDirect: this.autoPrintDirect,
            baudRate: this.baudRate,
            device,
            savedName,
            savedAddress: isNat && this.connectionMode === 'BLUETOOTH' ? bluetoothPrinter.savedAddress : null,
        };
    }

    setPaperWidth(width) {
        this.paperWidth = width;
        setStorageItem('pos_printer_width', width);
        this.notify();
    }

    setAutoPrintDirect(val) {
        this.autoPrintDirect = Boolean(val);
        setStorageItem('pos_printer_direct', String(this.autoPrintDirect));
        this.notify();
    }

    setBaudRate(rate) {
        this.baudRate = parseInt(rate, 10);
        setStorageItem('pos_printer_baud', String(this.baudRate));
        this.notify();
    }

    async autoReconnect() {
        if (this.isNative()) {
            try {
                if (this.connectionMode === 'USB') {
                    const ok = await usbPrinter.autoReconnect();
                    this.isConnected = usbPrinter.isConnected;
                    this.notify();
                    return ok;
                } else {
                    const ok = await bluetoothPrinter.autoReconnect();
                    this.isConnected = bluetoothPrinter.isConnected;
                    this.notify();
                    return ok;
                }
            } catch {
                return false;
            }
        }

        if (!this.isSupported() || this.isConnected) return false;
        try {
            const ports = await navigator.serial.getPorts();
            if (ports && ports.length > 0) {
                this.port = ports[0];
                await this.port.open({ baudRate: this.baudRate });
                this.isConnected = true;
                this.notify();
                return true;
            }
        } catch (err) {
            console.warn('Auto-reconnect serial printer skipped:', err);
            this.port = null;
            this.isConnected = false;
        }
        return false;
    }

    async listUsbDevices() {
        if (this.isNative()) {
            return await usbPrinter.listDevices();
        }
        return [];
    }

    async requestConnect(param = null) {
        if (this.isNative()) {
            if (this.connectionMode === 'USB') {
                // Connect via Android USB Host (supports USB Hub)
                const res = await usbPrinter.connect(param);
                this.isConnected = usbPrinter.isConnected;
                this.notify();
                return res;
            } else {
                // Connect via Android Bluetooth Classic
                const devices = await bluetoothPrinter.listPairedDevices();
                if (devices.length === 0) {
                    throw new Error('Tidak ada printer Bluetooth yang terpasang (paired). Pasangkan (pair) printer di menu Bluetooth Android terlebih dahulu.');
                }
                const target = devices.find(d => d.address === bluetoothPrinter.savedAddress) || devices[0];
                await bluetoothPrinter.connect(target.address, target.name);
                this.isConnected = true;
                this.notify();
                return target;
            }
        }

        if (!this.isSupported()) {
            throw new Error('WebSerial tidak didukung di browser ini. Gunakan Chrome atau Edge.');
        }

        if (param) {
            this.setBaudRate(param);
        }

        try {
            if (this.port && this.isConnected) {
                await this.disconnect();
            }

            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: this.baudRate });
            this.isConnected = true;
            this.notify();
            return true;
        } catch (err) {
            this.isConnected = false;
            this.notify();
            throw err;
        }
    }

    async disconnect() {
        if (this.isNative()) {
            if (this.connectionMode === 'USB') {
                await usbPrinter.disconnect();
            } else {
                await bluetoothPrinter.disconnect();
            }
            this.isConnected = false;
            this.notify();
            return;
        }

        if (this.port) {
            try {
                await this.port.close();
            } catch (err) {
                console.warn('Error closing serial port:', err);
            }
            this.port = null;
            this.isConnected = false;
            this.notify();
        }
    }

    async writeRawBytes(bytes) {
        if (this.isNative()) {
            if (this.connectionMode === 'USB') {
                await usbPrinter.writeBytes(bytes);
            } else {
                await bluetoothPrinter.writeBytes(bytes);
            }
            return;
        }

        if (!this.isConnected || !this.port || !this.port.writable) {
            throw new Error('Printer tidak terhubung atau port tidak writable.');
        }

        const writer = this.port.writable.getWriter();
        try {
            await writer.write(bytes);
        } finally {
            writer.releaseLock();
        }
    }

    async printTransaction(transaction, coopInfo = {}) {
        const status = this.getStatus();
        if (!status.isConnected) {
            return false;
        }

        const bytes = buildReceiptEscPos(transaction, coopInfo, {
            paperWidth: this.paperWidth,
            kickDrawer: true,
        });

        await this.writeRawBytes(bytes);
        return true;
    }

    async printSupplierPayout(payoutData, coopInfo = {}) {
        const status = this.getStatus();
        if (!status.isConnected) {
            return false;
        }

        const bytes = buildSupplierPayoutEscPos(payoutData, coopInfo, {
            paperWidth: this.paperWidth,
        });

        await this.writeRawBytes(bytes);
        return true;
    }

    async printSupplierCodPayout(codData, coopInfo = {}) {
        const status = this.getStatus();
        if (!status.isConnected) {
            return false;
        }

        const bytes = buildSupplierCodPayoutEscPos(codData, coopInfo, {
            paperWidth: this.paperWidth,
        });

        await this.writeRawBytes(bytes);
        return true;
    }

    async printBatchSummary(batchData, coopInfo = {}) {
        const status = this.getStatus();
        if (!status.isConnected) {
            return false;
        }

        const bytes = buildBatchSummaryEscPos(batchData, coopInfo, {
            paperWidth: this.paperWidth,
        });

        await this.writeRawBytes(bytes);
        return true;
    }

    async printMorningConsignmentWorkflow(data, coopInfo = {}) {
        const status = this.getStatus();
        if (!status.isConnected) {
            return false;
        }

        const bytes = buildConsignmentMorningWorkflowEscPos(data, coopInfo, {
            paperWidth: this.paperWidth,
        });

        await this.writeRawBytes(bytes);
        return true;
    }

    async kickCashDrawer() {
        const status = this.getStatus();
        if (!status.isConnected) {
            throw new Error('Printer tidak terhubung.');
        }
        const bytes = new Uint8Array([...CMD.INIT, ...CMD.KICK_DRAWER]);
        await this.writeRawBytes(bytes);
        return true;
    }

    async testPrint(coopInfo = {}) {
        const status = this.getStatus();
        if (!status.isConnected) {
            throw new Error('Printer tidak terhubung.');
        }
        const bytes = buildTestReceiptEscPos(coopInfo, { paperWidth: this.paperWidth });
        await this.writeRawBytes(bytes);
        return true;
    }
}

export const thermalPrinter = new ThermalPrinterDriver();

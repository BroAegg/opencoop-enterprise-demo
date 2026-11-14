/**
 * UsbPrinterBridge.js: Native Android USB Host Driver for Thermal Receipt Printers (Eppos, Xprinter, Panda, etc.).
 * 
 * Works inside Capacitor Android Hybrid App via Android USB Host API to communicate directly
 * with USB thermal receipt printers connected via USB OTG cable or multi-port USB Hub.
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

const getStorageItem = (key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null);
const setStorageItem = (key, val) => (typeof window !== 'undefined' ? localStorage.setItem(key, val) : undefined);

let usbPlug;
try {
    usbPlug = registerPlugin('UsbPrinter', {
        web: () => ({
            list: async () => ({ devices: [], count: 0 }),
            connect: async () => { throw new Error('USB Printer hanya didukung di aplikasi native Android'); },
            disconnect: async () => ({ isConnected: false }),
            write: async () => ({ success: true }),
            getStatus: async () => ({ isConnected: false, name: null }),
        })
    });
} catch {
    usbPlug = {
        list: async () => ({ devices: [], count: 0 }),
        connect: async () => { throw new Error('USB Printer hanya didukung di aplikasi native Android'); },
        disconnect: async () => ({ isConnected: false }),
        write: async () => ({ success: true }),
        getStatus: async () => ({ isConnected: false, name: null }),
    };
}

export const UsbPrinter = usbPlug;

class UsbPrinterBridge {
    constructor() {
        this.isConnected = false;
        this.connectedDevice = null;
        this.savedDeviceId = getStorageItem('pos_usb_printer_id');
        this.savedName = getStorageItem('pos_usb_printer_name');
        this.listeners = new Set();

        if (this.isNative()) {
            this.initListeners();
        }
    }

    isNative() {
        return Capacitor.isNativePlatform();
    }

    async initListeners() {
        try {
            if (UsbPrinter?.addListener) {
                await UsbPrinter.addListener('usbPrinterStateChange', (status) => {
                    this.isConnected = Boolean(status?.isConnected);
                    if (this.isConnected) {
                        this.connectedDevice = {
                            id: status.deviceId,
                            name: status.name,
                            vendorId: status.vendorId,
                            productId: status.productId,
                        };
                    } else {
                        this.connectedDevice = null;
                    }
                    this.notify(this.getStatus());
                });

                await UsbPrinter.addListener('usbDevicesChanged', () => {
                    this.notify(this.getStatus());
                });
            }
        } catch (e) {
            console.warn('UsbPrinter listeners init skipped:', e);
        }
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(state) {
        this.listeners.forEach((fn) => {
            try { fn(state); } catch (e) { console.error('UsbListener error:', e); }
        });
    }

    /**
     * List all USB devices detected on the tablet (directly or via USB Hub)
     */
    async listDevices() {
        if (!this.isNative()) return [];
        try {
            const res = await UsbPrinter.list();
            return res?.devices || [];
        } catch (err) {
            console.warn('Error listing USB devices:', err);
            return [];
        }
    }

    /**
     * Connect to a USB printer (auto-detects Eppos / thermal printer if deviceId is omitted)
     */
    async connect(deviceId = null) {
        if (!this.isNative()) {
            throw new Error('USB Host Printer hanya tersedia di aplikasi Android Native.');
        }

        try {
            const payload = deviceId ? { deviceId: Number(deviceId) } : {};
            const res = await UsbPrinter.connect(payload);
            this.isConnected = Boolean(res?.isConnected || res?.success);
            this.connectedDevice = {
                id: res.deviceId,
                name: res.name || 'Printer Thermal USB (Eppos)',
                vendorId: res.vendorId,
                productId: res.productId,
            };
            this.savedDeviceId = res.deviceId;
            this.savedName = res.name;
            setStorageItem('pos_usb_printer_id', String(res.deviceId));
            if (res.name) setStorageItem('pos_usb_printer_name', res.name);
            this.notify(this.getStatus());
            return res;
        } catch (err) {
            this.isConnected = false;
            this.connectedDevice = null;
            this.notify(this.getStatus());
            throw err;
        }
    }

    async autoReconnect() {
        if (!this.isNative()) return false;
        try {
            const status = await UsbPrinter.getStatus();
            if (status && status.isConnected) {
                this.isConnected = true;
                this.connectedDevice = {
                    id: status.deviceId,
                    name: status.name,
                    vendorId: status.vendorId,
                    productId: status.productId,
                };
                this.notify(this.getStatus());
                return true;
            }
            // Auto connect to first detected printer or saved device
            const res = await this.connect(this.savedDeviceId ? Number(this.savedDeviceId) : null);
            return Boolean(res && (res.success || res.isConnected));
        } catch {
            return false;
        }
    }

    async disconnect() {
        if (!this.isNative()) return;
        try {
            await UsbPrinter.disconnect();
        } catch (err) {
            console.warn('Error disconnecting USB printer:', err);
        } finally {
            this.isConnected = false;
            this.connectedDevice = null;
            this.notify(this.getStatus());
        }
    }

    /**
     * Write raw ESC/POS byte array to USB printer via Bulk OUT endpoint
     */
    async writeBytes(bytes) {
        if (!this.isConnected) {
            // Try connecting automatically
            await this.connect(this.savedDeviceId ? Number(this.savedDeviceId) : null);
        }

        try {
            let binaryStr = '';
            for (let i = 0; i < bytes.length; i++) {
                binaryStr += String.fromCharCode(bytes[i]);
            }
            const base64Data = btoa(binaryStr);

            await UsbPrinter.write({ value: base64Data });
            return true;
        } catch (err) {
            this.isConnected = false;
            this.notify(this.getStatus());
            throw new Error(`Gagal mencetak ke printer USB: ${err.message || err}`);
        }
    }

    getStatus() {
        return {
            isNative: this.isNative(),
            isConnected: this.isConnected,
            connectedDevice: this.connectedDevice,
            savedDeviceId: this.savedDeviceId,
            savedName: this.savedName,
        };
    }
}

export const usbPrinter = new UsbPrinterBridge();

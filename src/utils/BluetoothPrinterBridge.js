/**
 * BluetoothPrinterBridge.js: Native Android Bluetooth Classic (SPP) Driver for ESC/POS Thermal Printers.
 * 
 * Works inside Capacitor Android Hybrid App to connect directly to 58mm/80mm Bluetooth thermal printers
 * (e.g. Panda, Iware, Eppos, RPP02N, Zijiang, Xprinter) via RFCOMM SPP channel.
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

const getStorageItem = (key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null);
const setStorageItem = (key, val) => (typeof window !== 'undefined' ? localStorage.setItem(key, val) : undefined);

let btSerial;
try {
    btSerial = registerPlugin('BluetoothSerial', {
        web: () => ({
            isEnabled: async () => ({ enabled: false }),
            enable: async () => ({ enabled: false }),
            list: async () => ({ devices: [] }),
            connect: async () => { throw new Error('Bluetooth printer hanya didukung di aplikasi native Android'); },
            disconnect: async () => ({ success: true }),
            write: async () => ({ success: true }),
        })
    });
} catch {
    btSerial = {
        isEnabled: async () => ({ enabled: false }),
        enable: async () => ({ enabled: false }),
        list: async () => ({ devices: [] }),
        connect: async () => { throw new Error('Bluetooth printer hanya didukung di aplikasi native Android'); },
        disconnect: async () => ({ success: true }),
        write: async () => ({ success: true }),
    };
}

export const BluetoothSerial = btSerial;

class BluetoothPrinterBridge {
    constructor() {
        this.isConnected = false;
        this.connectedDevice = null;
        this.savedAddress = getStorageItem('pos_bt_printer_address');
        this.savedName = getStorageItem('pos_bt_printer_name');
        this.listeners = new Set();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(state) {
        this.listeners.forEach((fn) => {
            try { fn(state); } catch (e) { console.error('BtListener error:', e); }
        });
    }

    isNative() {
        return Capacitor.isNativePlatform();
    }

    async isEnabled() {
        if (!this.isNative()) return false;
        try {
            const res = await BluetoothSerial.isEnabled();
            return Boolean(res.enabled);
        } catch {
            return false;
        }
    }

    async enable() {
        if (!this.isNative()) return false;
        try {
            const res = await BluetoothSerial.enable();
            return Boolean(res.enabled);
        } catch (err) {
            console.warn('Bluetooth enable request rejected:', err);
            return false;
        }
    }

    /**
     * List bonded (paired) Bluetooth devices on the tablet.
     */
    async listPairedDevices() {
        if (!this.isNative()) return [];
        try {
            const res = await BluetoothSerial.list();
            return res.devices || [];
        } catch (err) {
            console.error('Failed to list paired Bluetooth devices:', err);
            return [];
        }
    }

    /**
     * Connect to a Bluetooth thermal printer by MAC address.
     */
    async connect(address, name = null) {
        if (!this.isNative()) {
            throw new Error('Bluetooth Printer hanya tersedia di aplikasi Android Native.');
        }

        const isBtOn = await this.isEnabled();
        if (!isBtOn) {
            const enabled = await this.enable();
            if (!enabled) {
                throw new Error('Bluetooth belum aktif di tablet kasir.');
            }
        }

        try {
            await BluetoothSerial.connect({ address });
            this.isConnected = true;
            this.connectedDevice = { address, name: name || 'Thermal Printer' };
            this.savedAddress = address;
            this.savedName = name;
            setStorageItem('pos_bt_printer_address', address);
            if (name) setStorageItem('pos_bt_printer_name', name);
            this.notify(this.getStatus());
            return true;
        } catch (err) {
            this.isConnected = false;
            this.connectedDevice = null;
            this.notify(this.getStatus());
            throw new Error(`Gagal menghubungkan ke printer Bluetooth (${name || address}): ${err.message || err}`);
        }
    }

    async autoReconnect() {
        if (!this.isNative() || !this.savedAddress || this.isConnected) return false;
        try {
            await this.connect(this.savedAddress, this.savedName);
            return true;
        } catch {
            // Silently ignore background reconnect failures
            return false;
        }
    }

    async disconnect() {
        if (!this.isNative() || !this.connectedDevice) return;
        try {
            await BluetoothSerial.disconnect({ address: this.connectedDevice.address });
        } catch (err) {
            console.warn('Error disconnecting BT printer:', err);
        } finally {
            this.isConnected = false;
            this.connectedDevice = null;
            this.notify(this.getStatus());
        }
    }

    /**
     * Send raw ESC/POS byte array directly to printer over RFCOMM socket.
     * 
     * @param {Uint8Array} bytes 
     */
    async writeBytes(bytes) {
        if (!this.isConnected || !this.connectedDevice) {
            // Try auto reconnect first
            if (this.savedAddress) {
                await this.connect(this.savedAddress, this.savedName);
            } else {
                throw new Error('Printer Bluetooth belum terhubung.');
            }
        }

        try {
            // Convert Uint8Array to base64 for native transmission
            let binaryStr = '';
            for (let i = 0; i < bytes.length; i++) {
                binaryStr += String.fromCharCode(bytes[i]);
            }
            const base64Data = btoa(binaryStr);

            await BluetoothSerial.write({
                address: this.connectedDevice.address,
                value: base64Data,
            });
            return true;
        } catch (err) {
            this.isConnected = false;
            throw new Error(`Gagal mengirim data cetak ke printer Bluetooth: ${err.message || err}`);
        }
    }

    getStatus() {
        return {
            isNative: this.isNative(),
            isConnected: this.isConnected,
            connectedDevice: this.connectedDevice,
            savedAddress: this.savedAddress,
            savedName: this.savedName,
        };
    }
}

export const bluetoothPrinter = new BluetoothPrinterBridge();

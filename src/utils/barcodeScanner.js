import { useEffect, useRef } from 'react';

/**
 * Play authentic POS register beep feedback via Web Audio API.
 * No external sound files needed.
 * 
 * @param {'success'|'error'|'info'|boolean} type 
 */
export const playScanSound = (type = 'success') => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        if (type === 'multiplier') {
            // Dual-tone chirp (1200 Hz -> 1600 Hz) for quantity increment/multiplier
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        } else if (type === 'checkout') {
            // Bright cheerful register bell chime (880 Hz -> 1760 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            gain1.gain.setValueAtTime(0.18, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.15);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.1);
            gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            osc2.start(ctx.currentTime + 0.1);
            osc2.stop(ctx.currentTime + 0.35);
        } else if (type === 'success' || type === true) {
            // High crisp positive beep (1760 Hz / A6)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1760, ctx.currentTime);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.09);
        } else if (type === 'error' || type === false) {
            // Low double buzz alert (280 Hz)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(280, ctx.currentTime);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.22);
        } else {
            // Subtle info chime (880 Hz)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        }
    } catch (e) {
        // AudioContext may be suspended before user gesture, safe to ignore
    }
};

/**
 * Custom React hook for capturing barcode scanner input globally.
 * Hardware barcode scanners act as keyboard input (HID) typing rapid characters (<50ms) followed by 'Enter'.
 * 
 * This hook:
 * 1. Automatically intercepts scanner input even if user clicked outside the input field.
 * 2. Redirects or directly calls onScan(barcode).
 * 3. Keeps primary input field focused when no modal is open.
 * 
 * @param {Object} options
 * @param {(barcode: string) => void} options.onScan Callback when a barcode is scanned
 * @param {React.RefObject<HTMLInputElement>} [options.inputRef] Input ref to keep focused
 * @param {boolean} [options.enabled=true] Whether scanner listening is enabled
 * @param {boolean} [options.isModalOpen=false] Disables auto-focus if a modal is open
 */
export function useBarcodeScanner({
    onScan,
    inputRef,
    enabled = true,
    isModalOpen = false,
}) {
    const bufferRef = useRef('');
    const lastKeyTimeRef = useRef(0);

    // Initial focus on mount (Desktop only - never on touch tablets)
    useEffect(() => {
        if (!enabled || isModalOpen) return;

        const isTouch = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
        if (!isTouch && inputRef?.current) {
            inputRef.current.focus();
        }
    }, [enabled, isModalOpen, inputRef]);

    useEffect(() => {
        if (!enabled || isModalOpen) return;

        const handleKeyDown = (e) => {
            // Ignore shortcut combos like Ctrl+C, Alt+Tab, etc.
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            const now = Date.now();
            const timeDiff = now - lastKeyTimeRef.current;
            lastKeyTimeRef.current = now;

            const activeTag = document.activeElement?.tagName?.toLowerCase();
            const isTypingInAnotherInput = (activeTag === 'input' || activeTag === 'textarea') && 
                document.activeElement !== inputRef?.current;

            if (isTypingInAnotherInput) {
                // Let user type into specific inputs (e.g. member query, payment modal)
                return;
            }

            if (e.key === 'Enter') {
                const code = bufferRef.current.trim();
                bufferRef.current = '';

                if (code.length >= 2) {
                    e.preventDefault();
                    e.stopImmediatePropagation?.();
                    e.stopPropagation?.();
                    onScan(code);
                }
                return;
            }

            // Printable single characters (letters, numbers, symbols)
            if (e.key.length === 1) {
                // If keys arrive in rapid succession (< 80ms) or buffer is ongoing, treat as scanner
                if (timeDiff > 250) {
                    // Reset buffer if human typing paused
                    bufferRef.current = '';
                }
                bufferRef.current += e.key;

                // Only refocus on desktop PCs (never on touch screens to prevent OSK popup)
                const isTouch = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
                if (!isTouch && inputRef?.current && document.activeElement !== inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [enabled, isModalOpen, onScan, inputRef]);
}

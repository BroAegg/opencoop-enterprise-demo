import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import useFloatingPopover from './useFloatingPopover';

/**
 * TactileCombobox
 * Searchable autocomplete select with keyboard navigation, tactile Apple HIG styling,
 * and React Portal positioning so dropdown menus never get clipped by parent overflow containers.
 */
export default function TactileCombobox({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Pilih opsi...',
    searchPlaceholder = 'Ketik untuk mencari...',
    error,
    disabled = false,
    clearable = true,
    isMulti = false,
    helpText,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const inputRef = useRef(null);

    const handleClose = useCallback(() => setIsOpen(false), []);
    const { triggerRef, popoverRef, style } = useFloatingPopover({
        isOpen,
        onClose: handleClose,
        matchWidth: true,
        estimatedHeight: 264,
        gap: 6,
    });

    // Filter options based on search query
    const filteredOptions = options.filter((opt) => {
        const query = search.toLowerCase();
        return (
            opt.label?.toLowerCase().includes(query) ||
            opt.subtext?.toLowerCase().includes(query) ||
            String(opt.value).toLowerCase().includes(query)
        );
    });

    // Selected options resolution
    const selectedOption = isMulti
        ? options.filter((opt) => Array.isArray(value) && value.includes(opt.value))
        : options.find((opt) => opt.value === value);

    const handleSelect = (option) => {
        if (isMulti) {
            const currentArr = Array.isArray(value) ? value : [];
            const exists = currentArr.includes(option.value);
            const nextArr = exists
                ? currentArr.filter((v) => v !== option.value)
                : [...currentArr, option.value];
            onChange?.(nextArr);
        } else {
            onChange?.(option.value, option);
            setIsOpen(false);
            setSearch('');
        }
    };

    const handleRemoveTag = (e, tagValue) => {
        e.stopPropagation();
        if (isMulti && Array.isArray(value)) {
            onChange?.(value.filter((v) => v !== tagValue));
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.(isMulti ? [] : '');
        setSearch('');
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === 'Enter' && highlightIndex >= 0 && filteredOptions[highlightIndex]) {
            e.preventDefault();
            handleSelect(filteredOptions[highlightIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-[13px] font-medium text-slate-700">
                    {label}
                </label>
            )}

            <div className="relative" ref={triggerRef}>
                {/* Trigger Box */}
                <div
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen(!isOpen);
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    className={`
                        w-full min-h-[42px] px-3.5 py-2 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-between gap-2 select-none
                        ${error
                            ? 'bg-rose-50/50 border border-rose-300 text-rose-900 focus:ring-4 focus:ring-rose-400/10'
                            : isOpen
                                ? 'bg-white border-2 border-[#1F6376] shadow-[0_2px_4px_rgba(0,0,0,0.04)] ring-4 ring-[#1F6376]/10'
                                : 'bg-slate-50/90 border border-slate-200/80 shadow-inner hover:bg-slate-100/60 focus:bg-white focus:border-[#1F6376]'}
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
                    `}
                >
                    {/* Selected Display / Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                        {isMulti ? (
                            Array.isArray(selectedOption) && selectedOption.length > 0 ? (
                                selectedOption.map((opt) => (
                                    <span
                                        key={opt.value}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#1F6376]/10 text-[#1F6376] border border-[#1F6376]/20"
                                    >
                                        {opt.label}
                                        <X
                                            className="w-3 h-3 hover:text-rose-600 transition-colors"
                                            onClick={(e) => handleRemoveTag(e, opt.value)}
                                        />
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 text-xs sm:text-sm">{placeholder}</span>
                            )
                        ) : selectedOption ? (
                            <span className="font-medium text-slate-800 truncate">
                                {selectedOption.label}
                            </span>
                        ) : (
                            <span className="text-slate-400 text-xs sm:text-sm">{placeholder}</span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 text-slate-400 shrink-0">
                        {clearable && ((isMulti && value?.length > 0) || (!isMulti && value)) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-0.5 hover:text-slate-600 rounded-full"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1F6376]' : ''}`} />
                    </div>
                </div>

                {/* Dropdown Menu (Portaled to escape parent overflow-hidden cards/modals) */}
                {isOpen && style && typeof document !== 'undefined' && createPortal(
                    <div
                        ref={popoverRef}
                        style={style}
                        className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.14)] p-2 max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-150"
                    >
                        {/* Search Input */}
                        <div className="relative mb-1.5 shrink-0">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setHighlightIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200/80 focus:outline-none focus:bg-white focus:border-[#1F6376] text-slate-800"
                            />
                        </div>

                        {/* List of Options */}
                        <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt, idx) => {
                                    const isSelected = isMulti
                                        ? Array.isArray(value) && value.includes(opt.value)
                                        : value === opt.value;
                                    const isHighlighted = idx === highlightIndex;

                                    return (
                                        <div
                                            key={opt.value}
                                            onClick={() => handleSelect(opt)}
                                            onMouseEnter={() => setHighlightIndex(idx)}
                                            className={`
                                                px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors
                                                ${isSelected ? 'bg-[#1F6376]/10 text-[#1F6376] font-bold' : ''}
                                                ${isHighlighted && !isSelected ? 'bg-slate-50 text-slate-900' : ''}
                                                ${!isSelected && !isHighlighted ? 'text-slate-700' : ''}
                                            `}
                                        >
                                            <div className="min-w-0 pr-2">
                                                <div className="truncate">{opt.label}</div>
                                                {opt.subtext && (
                                                    <div className="text-[10px] text-slate-400 font-normal truncate">
                                                        {opt.subtext}
                                                    </div>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <Check className="w-3.5 h-3.5 text-[#1F6376] shrink-0 stroke-[2.5]" />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                                    Tidak ada hasil pencarian
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            {helpText && !error && (
                <span className="text-[11px] text-slate-400">{helpText}</span>
            )}
            {error && (
                <span className="text-[11px] text-rose-500 font-medium">{error}</span>
            )}
        </div>
    );
}


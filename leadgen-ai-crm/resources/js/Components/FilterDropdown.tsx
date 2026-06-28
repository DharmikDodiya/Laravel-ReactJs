import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * FilterDropdown — A polished, reusable dropdown component for filter selects.
 * Uses a portal to render the popover at document.body level so it is never
 * clipped by parent overflow:hidden containers.
 *
 * @param {string}   value       - Current selected value ('' = show all / placeholder)
 * @param {function} onChange    - Callback when value changes: (newValue) => void
 * @param {Array}    options     - [{ value: '', label: 'All', icon?, dot?, color? }, ...]
 * @param {string}   icon        - Material icon name for the trigger (e.g. 'filter_list')
 * @param {string}   placeholder - Label when nothing is selected (default: 'All')
 * @param {string}   className   - Extra classes on the wrapper
 * @param {string}   popoverWidth - Tailwind width class for the popover (default: 'w-[220px]')
 */
export default function FilterDropdown({
    value,
    onChange,
    options = [],
    icon = 'filter_list',
    placeholder = 'All',
    className = '',
    popoverWidth = 'w-[220px]',
}) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);

    // Find the current option
    const current = options.find(o => o.value === value);
    const displayLabel = current?.label || placeholder;

    // Reposition popover relative to trigger
    const reposition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        // Check if dropdown would go off the right edge
        const viewportWidth = window.innerWidth;
        let left = rect.left + scrollX;
        // On mobile, align to right edge of trigger if it overflows
        if (left + 220 > viewportWidth) {
            left = rect.right + scrollX - 220;
        }

        setPos({
            top: rect.bottom + scrollY + 6,
            left: Math.max(8, left), // 8px minimum from left edge
        });
    }, []);

    // Open handler
    const handleOpen = () => {
        reposition();
        setOpen(prev => !prev);
    };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    // Reposition on scroll/resize while open
    useEffect(() => {
        if (!open) return;
        const handler = () => reposition();
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [open, reposition]);

    const select = (val) => {
        onChange(val);
        setOpen(false);
    };

    const hasValue = value !== '' && value !== null && value !== undefined;

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Trigger */}
            <button
                ref={triggerRef}
                type="button"
                onClick={handleOpen}
                className={`
                    inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl
                    border text-body-sm font-medium transition-all duration-200
                    cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap
                    ${hasValue
                        ? 'bg-primary-fixed/40 text-primary border-primary/30 hover:bg-primary-fixed/60'
                        : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }
                `}
            >
                <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '18px', fontVariationSettings: hasValue ? "'FILL' 1" : "'FILL' 0" }}
                >
                    {icon}
                </span>
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{displayLabel}</span>
                {hasValue && (
                    <span
                        onClick={(e) => { e.stopPropagation(); select(''); }}
                        className="w-4 h-4 rounded-full bg-primary/15 hover:bg-primary/30 flex items-center justify-center transition-colors"
                        title="Clear filter"
                    >
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }}>close</span>
                    </span>
                )}
                <span
                    className={`material-symbols-outlined transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    style={{ fontSize: '16px' }}
                >
                    expand_more
                </span>
            </button>

            {/* Portal-rendered popover — renders at body level to avoid overflow clipping */}
            {open && createPortal(
                <div
                    ref={popoverRef}
                    className={`fixed-dropdown-popover ${popoverWidth} animate-dropdown-in`}
                    style={{
                        position: 'absolute',
                        top: `${pos.top}px`,
                        left: `${pos.left}px`,
                        zIndex: 9999,
                    }}
                >
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl overflow-hidden max-h-[280px] flex flex-col">
                        {/* Options list */}
                        <div className="py-1 overflow-y-auto custom-scrollbar">
                            {options.map((opt) => {
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value ?? '__all__'}
                                        type="button"
                                        onClick={() => select(opt.value)}
                                        className={`
                                            w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-150
                                            ${isSelected
                                                ? 'bg-primary-fixed/40 text-primary font-semibold'
                                                : 'text-on-surface hover:bg-surface-container-low'
                                            }
                                        `}
                                    >
                                        {opt.icon && (
                                            <span
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                                    opt.color || (isSelected ? 'bg-primary-fixed' : 'bg-surface-container')
                                                }`}
                                            >
                                                <span
                                                    className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}
                                                    style={{ fontSize: '16px', fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                                                >
                                                    {opt.icon}
                                                </span>
                                            </span>
                                        )}
                                        {opt.dot && !opt.icon && (
                                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                                        )}
                                        <span className="flex-1 text-body-sm truncate">{opt.label}</span>
                                        {isSelected && (
                                            <span
                                                className="material-symbols-outlined text-primary"
                                                style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
                                            >
                                                check_circle
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

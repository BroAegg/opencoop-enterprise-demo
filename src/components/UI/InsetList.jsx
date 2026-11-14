import React from 'react';

export default function InsetList({ children, title, className = '' }) {
    return (
        <div className={`w-full ${className}`}>
            {title && (
                <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-5 mb-2.5">
                    {title}
                </h3>
            )}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                {/* 
                  To apply borders correctly to children, we map over them.
                  Alternatively, children can handle their own borders using group or last:border-0,
                  but for simplicity we let InsetListItem handle its own bottom border.
                */}
                {React.Children.map(children, (child, index) => {
                    if (!React.isValidElement(child)) return child;
                    // Do not pass custom props like isLast to native HTML DOM elements (div, span, etc.)
                    if (typeof child.type === 'string') return child;
                    
                    // Pass isLast prop to custom React components (InsetListItem, TransactionItem, etc.)
                    return React.cloneElement(child, {
                        isLast: index === React.Children.count(children) - 1
                    });
                })}
            </div>
        </div>
    );
}


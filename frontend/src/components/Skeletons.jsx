import React from "react";

export const CardSkeleton = () => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="flex justify-between items-start">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        </div>
        <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-16 bg-slate-200 rounded-lg"></div>
        <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <div className="h-8 bg-slate-200 rounded-lg flex-1"></div>
            <div className="h-8 bg-slate-200 rounded-lg flex-1"></div>
        </div>
    </div>
);

export const ListSkeleton = () => (
    <div className="space-y-3.5 animate-pulse">
        {[1, 2, 3].map(i => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex gap-3.5 items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
            </div>
        ))}
    </div>
);

export const BoardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(col => (
            <div key={col} className="p-4 rounded-2xl bg-slate-100/50 border border-slate-200 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded-full w-8"></div>
                </div>
                <div className="space-y-3.5">
                    {[1, 2].map(item => (
                        <div key={item} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                            <div className="flex justify-between pt-2">
                                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

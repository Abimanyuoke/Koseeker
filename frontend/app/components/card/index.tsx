"use client";

import { ReactNode } from "react";

type CardOption = {
    icon: any;
    value: string;
    label: string;
};

type Props = {
    value: string;
    onChange: (value: string) => void;
    options: CardOption[];
    label?: string;
    required?: boolean;
    className?: string;
    icon?: ReactNode;
};

const CardSelect = ({ value, onChange, options, label, required, className }: Props) => {
    return (
        <div className={`flex flex-col gap-2 my-3 ${className}`} >
            {label && (
                <label className="text-xs font-bold text-slate-500">
                    {label}
                    {required && <sup className="text-red-600">*&#41;</sup>}
                </label>
            )}
            <div className="flex gap-4">
                {options.map((option) => (
                    <button
                        type="button"
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`flex-1 p-4 rounded-lg border text-sm font-semibold ${value === option.value
                            ? "bg-primary text-white border-white"
                            : "bg-white text-gray-700 border-gray-300"
                            } hover:shadow-md transition`}
                    >
                        <div className="flex items-center justify-center gap-2">
                        {option.icon && <div className="text-2xl">{option.icon}</div>}
                        {option.label}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CardSelect;

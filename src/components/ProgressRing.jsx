import React from 'react';

const ProgressRing = ({ radius, stroke, progress, color }) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset: 0 }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-slate-100"
                />
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={color || "text-emerald-500 transition-all duration-1000 ease-out"}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{Math.round(progress)}%</span>
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Goal</span>
            </div>
        </div>
    );
};

export default ProgressRing;

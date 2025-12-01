'use client';

interface MetricCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon?: string;
}

export default function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
}

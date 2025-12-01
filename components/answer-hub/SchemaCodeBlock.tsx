'use client';

interface SchemaCodeBlockProps {
    schemaType: string;
    code: string;
}

export default function SchemaCodeBlock({ schemaType, code }: SchemaCodeBlockProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        alert('Schema copied to clipboard!');
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900">{schemaType}</h4>
                <button
                    onClick={handleCopy}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                    📋 Copy
                </button>
            </div>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
}

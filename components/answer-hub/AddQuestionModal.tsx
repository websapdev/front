'use client';

import { useState } from 'react';

interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (question: string, intent: string) => Promise<void>;
}

export default function AddQuestionModal({ isOpen, onClose, onSubmit }: AddQuestionModalProps) {
    const [question, setQuestion] = useState('');
    const [intent, setIntent] = useState('INFORMATIONAL');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(question, intent);
            setQuestion('');
            setIntent('INFORMATIONAL');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Question</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            rows={3}
                            placeholder="e.g., What are the best running shoes for flat feet?"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Intent
                        </label>
                        <select
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="INFORMATIONAL">Informational</option>
                            <option value="COMMERCIAL">Commercial</option>
                            <option value="NAVIGATIONAL">Navigational</option>
                            <option value="TRANSACTIONAL">Transactional</option>
                            <option value="UNKNOWN">Unknown</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

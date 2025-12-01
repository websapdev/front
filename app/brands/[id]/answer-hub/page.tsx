'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MetricCard from '@/components/answer-hub/MetricCard';
import AddQuestionModal from '@/components/answer-hub/AddQuestionModal';
import SchemaCodeBlock from '@/components/answer-hub/SchemaCodeBlock';

interface Prompt {
    id: string;
    question: string;
    slug: string;
    status: string;
    intent: string;
    answerPage?: {
        id: string;
        title: string;
        isPublished: boolean;
        urlPath: string;
    };
}

interface AnswerPage {
    id: string;
    title: string;
    slug: string;
    urlPath: string;
    headlineSnippet: string;
    metaDescription?: string;
    isPublished: boolean;
    lastGeneratedAt?: string;
    answerPrompt: {
        question: string;
        status: string;
    };
    sections?: any[];
    faqItems?: any[];
    schemaBlocks?: any[];
}

export default function AnswerHubPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.id as string;

    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [pages, setPages] = useState<AnswerPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<AnswerPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [brandId]);

    const fetchData = async () => {
        try {
            const [promptsRes, pagesRes] = await Promise.all([
                fetch(`/api/brands/${brandId}/answer-prompts`),
                fetch(`/api/brands/${brandId}/answer-pages`)
            ]);

            const promptsData = await promptsRes.json();
            const pagesData = await pagesRes.json();

            setPrompts(promptsData);
            setPages(pagesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (question: string, intent: string) => {
        const res = await fetch(`/api/brands/${brandId}/answer-prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, intent })
        });

        if (res.ok) {
            await fetchData();
        } else {
            const error = await res.text();
            alert(`Error: ${error}`);
        }
    };

    const handleGenerate = async (promptId: string) => {
        setGenerating(promptId);
        try {
            const res = await fetch(`/api/brands/${brandId}/answer-pages/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promptId })
            });

            if (res.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error('Error generating:', error);
        } finally {
            setGenerating(null);
        }
    };

    const handlePublishToggle = async (pageId: string, isPublished: boolean) => {
        const endpoint = isPublished ? 'unpublish' : 'publish';
        const res = await fetch(`/api/brands/${brandId}/answer-pages/${pageId}/${endpoint}`, {
            method: 'POST'
        });

        if (res.ok) {
            await fetchData();
            if (selectedPage?.id === pageId) {
                const updated = await fetch(`/api/brands/${brandId}/answer-pages/${pageId}`);
                setSelectedPage(await updated.json());
            }
        }
    };

    const handleSelectPage = async (pageId: string) => {
        const res = await fetch(`/api/brands/${brandId}/answer-pages/${pageId}`);
        const data = await res.json();
        setSelectedPage(data);
    };

    const filteredPrompts = statusFilter === 'ALL'
        ? prompts
        : prompts.filter(p => p.status === statusFilter);

    const publishedCount = pages.filter(p => p.isPublished).length;
    const draftCount = prompts.filter(p => p.status === 'DRAFT').length;

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/brands/${brandId}`} className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">AI Answer Hub</h1>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Subtitle */}
                <p className="text-gray-600 mb-6">
                    Create AI-optimized answers that LLMs can quote directly
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <MetricCard title="Total Questions" value={prompts.length} icon="❓" />
                    <MetricCard title="Published Pages" value={publishedCount} icon="✅" />
                    <MetricCard title="Draft Questions" value={draftCount} icon="📝" />
                    <MetricCard title="AI-Targeted" value={0} icon="🎯" subtitle="Coming soon" />
                </div>

                {/* Add Question Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
                    >
                        + Add Question
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Questions List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Questions & Pages</h2>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                            >
                                <option value="ALL">All</option>
                                <option value="DRAFT">Draft</option>
                                <option value="GENERATED">Generated</option>
                                <option value="PUBLISHED">Published</option>
                            </select>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {filteredPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 text-sm flex-1">
                                            {prompt.question}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${prompt.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                            prompt.status === 'GENERATED' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {prompt.status}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-3">Intent: {prompt.intent}</p>

                                    <div className="flex gap-2">
                                        {!prompt.answerPage ? (
                                            <button
                                                onClick={() => handleGenerate(prompt.id)}
                                                disabled={generating === prompt.id}
                                                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {generating === prompt.id ? 'Generating...' : 'Generate Answer'}
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleSelectPage(prompt.answerPage!.id)}
                                                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                                                >
                                                    View/Edit
                                                </button>
                                                <button
                                                    onClick={() => handlePublishToggle(prompt.answerPage!.id, prompt.answerPage!.isPublished)}
                                                    className={`text-sm px-3 py-1 rounded ${prompt.answerPage!.isPublished
                                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        }`}
                                                >
                                                    {prompt.answerPage!.isPublished ? 'Unpublish' : 'Publish'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {filteredPrompts.length === 0 && (
                                <p className="text-center text-gray-500 py-8">
                                    No questions found. Add one to get started!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Answer Page Editor */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Answer Page Details</h2>

                        {selectedPage ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={selectedPage.title}
                                        readOnly
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Headline Snippet</label>
                                    <textarea
                                        value={selectedPage.headlineSnippet}
                                        readOnly
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Path</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={selectedPage.urlPath}
                                            readOnly
                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                                        />
                                        {selectedPage.isPublished && (
                                            <Link
                                                href={selectedPage.urlPath}
                                                target="_blank"
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                            >
                                                View Live
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sections ({selectedPage.sections?.length || 0})</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedPage.sections?.map((section: any, idx: number) => (
                                            <div key={idx} className="text-sm border-l-2 border-indigo-500 pl-3">
                                                <p className="font-medium">{section.heading}</p>
                                                <p className="text-gray-600 text-xs">{section.type}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">FAQ Items ({selectedPage.faqItems?.length || 0})</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedPage.faqItems?.map((faq: any, idx: number) => (
                                            <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                                <p className="font-medium">{faq.question}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Schema Blocks</label>
                                    {selectedPage.schemaBlocks?.map((block: any) => (
                                        <SchemaCodeBlock
                                            key={block.id}
                                            schemaType={block.schemaType}
                                            code={block.code}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-12">
                                Select a question to view its answer page details
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <AddQuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddQuestion}
            />
        </div>
    );
}

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/aiVisibility';

interface Props {
    params: {
        answerSlug: string;
    };
}

export default async function PublicAnswerPage({ params }: Props) {
    const { answerSlug } = params;

    // Find the answer page
    const page = await prisma.answerPage.findFirst({
        where: {
            slug: answerSlug,
            isPublished: true
        },
        include: {
            brand: true,
            sections: {
                orderBy: { order: 'asc' }
            },
            faqItems: true,
            schemaBlocks: true
        }
    });

    if (!page) {
        notFound();
    }

    const canonicalUrl = `https://${page.brand.primaryDomain}${page.urlPath}`;

    return (
        <>
            <head>
                <title>{page.title}</title>
                <meta name="description" content={page.metaDescription || page.headlineSnippet} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Schema.org JSON-LD */}
                {page.schemaBlocks.map((block: any) => (
                    <script
                        key={block.id}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: block.code }}
                    />
                ))}
            </head>

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
                        <p className="text-xl text-indigo-100">{page.headlineSnippet}</p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 py-12">
                    {/* Sections */}
                    {page.sections.map((section: any) => (
                        <section key={section.id} className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                                {section.body}
                            </div>
                        </section>
                    ))}

                    {/* FAQ Section */}
                    {page.faqItems.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {page.faqItems.map((faq: any, index: number) => (
                                    <details
                                        key={faq.id}
                                        className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                                    >
                                        <summary className="font-semibold text-gray-900 cursor-pointer">
                                            {faq.question}
                                        </summary>
                                        <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* About Brand Section */}
                    <section className="bg-indigo-50 rounded-lg p-8 mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About {page.brand.name}</h2>
                        <p className="text-gray-700 mb-4">
                            {page.brand.name} is a trusted leader in providing expert guidance and solutions.
                            Visit our website to learn more about how we can help you.
                        </p>
                        <a
                            href={`https://${page.brand.primaryDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
                        >
                            Visit {page.brand.name} →
                        </a>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
                    <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 text-sm">
                        <p>© {new Date().getFullYear()} {page.brand.name}. All rights reserved.</p>
                        <p className="mt-2">
                            Last updated: {page.lastGeneratedAt ? new Date(page.lastGeneratedAt).toLocaleDateString() : 'Recently'}
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
    const { answerSlug } = params;

    const page = await prisma.answerPage.findFirst({
        where: {
            slug: answerSlug,
            isPublished: true
        },
        include: { brand: true }
    });

    if (!page) {
        return {
            title: 'Page Not Found'
        };
    }

    return {
        title: page.title,
        description: page.metaDescription || page.headlineSnippet,
        openGraph: {
            title: page.title,
            description: page.headlineSnippet,
            url: `https://${page.brand.primaryDomain}${page.urlPath}`,
            type: 'article'
        }
    };
}

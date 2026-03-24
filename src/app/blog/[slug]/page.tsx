import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";
import { BlogPostContent } from "@/components/blog/blog-post-content";
import {
    allBlogSlugsForStaticParams,
    resolvePublishedBlogPost,
} from "@/lib/blog-public";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    const slugs = await allBlogSlugsForStaticParams();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await resolvePublishedBlogPost(slug);
    if (!post) return {};
    return {
        title: post.title,
        description: post.content.slice(0, 160).trim(),
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    const post = await resolvePublishedBlogPost(slug);

    if (!post) {
        return (
            <div className="pt-24 section-container section-padding text-center">
                <h1 className="heading-lg mb-4">Post Not Found</h1>
                <p className="body-lg mb-6">
                    This blog post doesn&apos;t exist yet.
                </p>
                <Link href="/blog" className="btn btn-primary">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24">
            <article className="section-container section-padding max-w-3xl mx-auto">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>

                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium">
                        {post.category}
                    </span>
                    <span className="body-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                    <span className="body-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                </div>

                <h1 className="heading-xl mb-8">{post.title}</h1>

                <BlogPostContent content={post.content} />

                <div className="card mt-12 text-center">
                    <h3 className="heading-sm mb-2">
                        Ready to optimize your wellness?
                    </h3>
                    <p className="body-sm mb-4">
                        Book a free consultation with our nutrition experts.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation{" "}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </article>
        </div>
    );
}

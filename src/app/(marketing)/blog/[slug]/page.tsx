"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { dbService } from "@/lib/firestore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Clock, Eye, Calendar, Share2, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);

    useEffect(() => {
        if (slug) {
            loadBlog();
        }
    }, [slug]);

    const loadBlog = async () => {
        const blogData = await dbService.getBlogBySlug(slug);
        if (blogData) {
            setBlog(blogData);
            await dbService.incrementBlogViews(blogData.id);

            // Load related blogs
            const allBlogs = await dbService.getBlogs({ published: true, category: blogData.category });
            setRelatedBlogs(allBlogs.filter(b => b.id !== blogData.id).slice(0, 3));
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <PublicHeader />
                <div className="pt-32 pb-20 px-6 text-center">
                    <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading blog post...</p>
                </div>
                <PublicFooter />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-white">
                <PublicHeader />
                <div className="pt-32 pb-20 px-6 text-center">
                    <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
                    <p className="text-slate-500">The blog post you're looking for doesn't exist.</p>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto mb-8">
                    <Link href="/blog">
                        <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                            <ArrowLeft className="size-4" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>

                <article className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Badge className="mb-4">{blog.category}</Badge>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-slate-900">{blog.title}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">{blog.author?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                <span>{new Date(blog.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="size-4" />
                                <span>{blog.readTime} min read</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="size-4" />
                                <span>{blog.views || 0} views</span>
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    {blog.coverImage && (
                        <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg prose-slate max-w-none mb-16">
                        <ReactMarkdown>{blog.content}</ReactMarkdown>
                    </div>

                    {/* Tags & Share */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-y border-slate-100 mb-16">
                        <div className="flex flex-wrap gap-2">
                            {blog.tags && blog.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="px-3 py-1">#{tag}</Badge>
                            ))}
                        </div>
                        <button
                            onClick={() => navigator.share?.({ title: blog.title, url: window.location.href })}
                            className="flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                            <Share2 className="size-4" />
                            Share this post
                        </button>
                    </div>

                    {/* Related Posts */}
                    {relatedBlogs.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-8 md:p-12">
                            <h2 className="text-2xl font-bold mb-8">More on {blog.category}</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {relatedBlogs.map(related => (
                                    <Link
                                        key={related.id}
                                        href={`/blog/${related.slug}`}
                                        className="group block"
                                    >
                                        <div className="relative h-48 mb-4 rounded-xl overflow-hidden shadow-sm">
                                            <Image
                                                src={related.coverImage || "/blog-placeholder.jpg"}
                                                alt={related.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                            {related.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                                            {related.excerpt || "Read more about this topic..."}
                                        </p>
                                        <div className="text-primary text-sm font-medium flex items-center gap-1">
                                            Read Article <ArrowRight className="size-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </main>

            <PublicFooter />
        </div>
    );
}

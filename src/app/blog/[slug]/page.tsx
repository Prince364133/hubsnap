"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { dbService, Blog, Comment } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Loader2, Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Calendar, User, Clock, Eye, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHeaderTitle } from "@/context/HeaderTitleContext";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

function BlogContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const slug = params.slug as string;
    const { setTitle } = useHeaderTitle();

    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    // Comments state
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        if (slug) {
            loadBlog();
        }
        return () => setTitle(null);
    }, [slug, setTitle]);

    const loadBlog = async () => {
        setLoading(true);
        const data = await dbService.getBlogBySlug(slug);

        if (data) {
            setBlog(data);
            setTitle(data.title);
            setLikesCount(data.likes || 0);

            // Track view
            // In strict mode this might run twice, but acceptable for now
            dbService.trackBlogView(data.id);

            if (user) {
                const [isLiked, isSaved] = await Promise.all([
                    dbService.isBlogLiked(data.id, user.uid),
                    dbService.isBlogSaved(data.id, user.uid)
                ]);
                setLiked(isLiked);
                setSaved(isSaved);
            }
            if (user) {
                const [isLiked, isSaved] = await Promise.all([
                    dbService.isBlogLiked(data.id, user.uid),
                    dbService.isBlogSaved(data.id, user.uid)
                ]);
                setLiked(isLiked);
                setSaved(isSaved);
            }

            // Load comments
            loadComments(data.id);
        }
        setLoading(false);
    };

    const loadComments = async (blogId: string) => {
        const data = await dbService.getComments(blogId);
        setComments(data);
    };

    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like this post");
            return;
        }
        if (!blog) return;

        // Optimistic update
        const newLikedState = !liked;
        const newCount = newLikedState ? likesCount + 1 : likesCount - 1;

        setLiked(newLikedState);
        setLikesCount(newCount);

        const result = await dbService.toggleBlogLike(blog.id, user.uid);
        // Only correct if server result differs (though toggle returns new state, we can trust optimistic for UI feel)
    };

    const handleSave = async () => {
        if (!user) {
            toast.error("Please login to save this post");
            return;
        }
        if (!blog) return;

        setSaved(!saved); // Optimistic
        const result = await dbService.toggleSaveBlog(blog.id, user.uid);
        if (result) {
            toast.success("Blog saved to your vault!");
        } else {
            toast.success("Blog removed from your vault.");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const handleSubmitComment = async () => {
        if (!user) {
            toast.error("Please login to comment");
            return;
        }
        if (!newComment.trim()) return;
        if (!blog) return;

        setCommentLoading(true);
        const success = await dbService.addComment(blog.id, user.uid, newComment, {
            name: user.displayName || "Anonymous",
            avatar: user.photoURL || undefined
        });

        if (success) {
            setNewComment("");
            toast.success("Comment added!");
            loadComments(blog.id);
            // Also update local comment count if we displayed it
        } else {
            toast.error("Failed to add comment");
        }
        setCommentLoading(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!blog) return;
        if (confirm("Are you sure you want to delete this comment?")) {
            const success = await dbService.deleteComment(blog.id, commentId);
            if (success) {
                setComments(prev => prev.filter(c => c.id !== commentId));
                toast.success("Comment deleted");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin size-10 text-primary" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
                <Link href="/blog">
                    <Button>Back to Blog</Button>
                </Link>
            </div>
        );
    }

    return (
        <article className="max-w-4xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8 space-y-6">
                <Link href="/blog" className="inline-flex items-center text-slate-500 hover:text-primary transition-colors mb-4">
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Blog
                </Link>

                <div className="flex gap-2 mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                        {blog.category}
                    </span>
                    {blog.tags?.map(tag => (
                        <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                            #{tag}
                        </span>
                    ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                    {blog.title}
                </h1>

                <div className="flex items-center gap-6 text-slate-500 text-sm border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-2">
                        <User className="size-4" />
                        <span>{blog.author?.name || 'HubSnap Team'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>{blog.createdAt?.seconds ? format(new Date(blog.createdAt.seconds * 1000), "MMMM d, yyyy") : "Recently"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span>{blog.readTime} min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="size-4" />
                        <span>{blog.views} views</span>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {blog.coverImage && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 shadow-lg">
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl mb-12"
                dangerouslySetInnerHTML={{ __html: blog.content }} // Using strict HTML since we used Quill
            />

            {/* Resources Section */}
            {blog.resources && blog.resources.length > 0 && (
                <div className="mt-12 mb-8 not-prose">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 border-b pb-2">
                        <LinkIcon className="size-5 text-primary" />
                        Resources & Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blog.resources.map((res, i) => (
                            <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/50 hover:shadow-md transition-all group"
                            >
                                <span className="font-medium text-slate-700 group-hover:text-primary transition-colors truncate pr-4">
                                    {res.label}
                                </span>
                                <ExternalLink className="size-4 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Interactions */}
            <div className="border-t border-slate-100 pt-8 mt-12">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <Button
                            variant={liked ? "default" : "outline"}
                            className={`rounded-full gap-2 ${liked ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}`}
                            onClick={handleLike}
                        >
                            <Heart className={`size-5 ${liked ? 'fill-white' : ''}`} />
                            {likesCount} Likes
                        </Button>
                        <Button variant="outline" className="rounded-full gap-2" onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}>
                            <MessageCircle className="size-5" />
                            Comment
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant={saved ? "default" : "outline"}
                            className={`rounded-full gap-2 ${saved ? 'bg-primary hover:bg-primary/90' : ''}`}
                            onClick={handleSave}
                        >
                            <Bookmark className={`size-5 ${saved ? 'fill-white' : ''}`} />
                            {saved ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full" onClick={handleShare}>
                            <Share2 className="size-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div id="comments-section" className="mt-16 pt-10 border-t border-slate-100">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    Comments
                    <span className="text-slate-400 text-lg font-normal">({comments.length})</span>
                </h3>

                {/* Comment Input */}
                <div className="bg-slate-50 rounded-xl p-6 mb-10">
                    {!user ? (
                        <div className="text-center py-4">
                            <p className="text-slate-600 mb-4">Please login to join the conversation.</p>
                            <Link href="/login">
                                <Button variant="outline">Login to Comment</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <div className="shrink-0">
                                {user.photoURL ? (
                                    <Image src={user.photoURL} alt={user.displayName || "User"} width={40} height={40} className="rounded-full" />
                                ) : (
                                    <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                        {user.displayName?.[0] || "U"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y bg-white"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmitComment}
                                        disabled={commentLoading || !newComment.trim()}
                                        className="rounded-full px-6"
                                    >
                                        {commentLoading ? <Loader2 className="animate-spin size-4 mr-2" /> : <MessageCircle className="size-4 mr-2" />}
                                        Post Comment
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                    {comments.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <MessageCircle className="size-10 mx-auto mb-3 opacity-20" />
                            <p>No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="shrink-0">
                                    {comment.userAvatar ? (
                                        <Image src={comment.userAvatar} alt={comment.userName} width={40} height={40} className="rounded-full" />
                                    ) : (
                                        <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                            {comment.userName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-none p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{comment.userName}</span>
                                                <span className="text-xs text-slate-400">
                                                    {comment.createdAt?.seconds ? format(new Date(comment.createdAt.seconds * 1000), "MMM d, yyyy") : "Just now"}
                                                </span>
                                            </div>
                                            {user && user.uid === comment.userId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </article>
    );
}

export default function BlogPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
            <BlogContent />
        </Suspense>
    );
}

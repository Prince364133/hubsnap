"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { dbService } from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Loader2, Image as ImageIcon, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadMode, setUploadMode] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        category: "",
        tags: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        published: false,
        resources: [] as { label: string; url: string }[]
    });

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean'],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }]
        ],
    }), []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const updates = { ...prev, [field]: value };
            if (field === 'title' && !prev.slug) {
                updates.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return updates;
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const storageRef = ref(storage, `blog-covers/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            handleChange('coverImage', downloadURL);
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (publish: boolean) => {
        if (!formData.title || !formData.content) {
            toast.error("Title and Content are required");
            return;
        }

        setLoading(true);
        try {
            const blogData: any = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
                published: publish,
                author: {
                    id: "admin", // Replace with real admin ID if available
                    name: "HubSnap Team"
                },
                readTime: Math.ceil(formData.content.split(' ').length / 200)
            };

            const id = await dbService.createBlog(blogData);
            if (id) {
                toast.success(publish ? "Blog published successfully!" : "Blog saved as draft!");
                router.push("/website_admin_pannel/blogs");
            } else {
                toast.error("Failed to create blog");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/website_admin_pannel/blogs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">New Blog Post</h1>
                        <p className="text-slate-500">Create compelling content for your audience</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
                        <Save className="size-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button onClick={() => handleSubmit(true)} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Eye className="size-4 mr-2" />}
                        Publish
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Blog Title</Label>
                            <Input
                                placeholder="Enter an engaging title..."
                                value={formData.title}
                                onChange={e => handleChange('title', e.target.value)}
                                className="text-lg font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Content</Label>
                            <div className="prose-admin">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={val => handleChange('content', val)}
                                    modules={modules}
                                    className="h-[500px] mb-12"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Eye className="size-4" /> SEO Settings
                        </h3>
                        <div className="space-y-2">
                            <Label>Slug (URL)</Label>
                            <Input
                                value={formData.slug}
                                onChange={e => handleChange('slug', e.target.value)}
                                placeholder="my-blog-post-url"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Meta Title</Label>
                            <Input
                                value={formData.metaTitle}
                                onChange={e => handleChange('metaTitle', e.target.value)}
                                placeholder="Title for search engines (defaults to blog title)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Textarea
                                value={formData.metaDescription}
                                onChange={e => handleChange('metaDescription', e.target.value)}
                                placeholder="Brief description heavily optimized for search engines..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Keywords (Comma separated)</Label>
                            <Input
                                value={formData.keywords}
                                onChange={e => handleChange('keywords', e.target.value)}
                                placeholder="react, nextjs, tutorial"
                            />
                        </div>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-4">
                        <h3 className="font-bold text-lg">Organization</h3>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                                value={formData.category}
                                onChange={e => handleChange('category', e.target.value)}
                                placeholder="e.g. Technology"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <Input
                                value={formData.tags}
                                onChange={e => handleChange('tags', e.target.value)}
                                placeholder="e.g. guide, tips (comma separated)"
                            />
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <ImageIcon className="size-4" /> Media
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 border-b">
                                <button
                                    className={`pb-2 text-sm font-medium ${!uploadMode ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}
                                    onClick={() => setUploadMode(false)}
                                >
                                    Image URL
                                </button>
                                <button
                                    className={`pb-2 text-sm font-medium ${uploadMode ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}
                                    onClick={() => setUploadMode(true)}
                                >
                                    Upload Image
                                </button>
                            </div>

                            {uploadMode ? (
                                <div className="space-y-2">
                                    <Label>Upload Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage && <p className="text-xs text-slate-500 animate-pulse">Uploading...</p>}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Cover Image URL</Label>
                                    <Input
                                        value={formData.coverImage || ""}
                                        onChange={e => handleChange('coverImage', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            {formData.coverImage && (
                                <div className="mt-2 rounded-lg overflow-hidden border aspect-video relative group bg-slate-100">
                                    <img src={formData.coverImage} alt="Cover" className="object-cover w-full h-full" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleChange('coverImage', '')}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <LinkIcon className="size-4" /> Resources
                        </h3>
                        <div className="space-y-3">
                            {formData.resources.map((res, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <div className="grid gap-2 flex-1">
                                        <Input
                                            placeholder="Label (e.g. Source Code)"
                                            value={res.label}
                                            onChange={e => {
                                                const newRes = [...formData.resources];
                                                newRes[index].label = e.target.value;
                                                setFormData({ ...formData, resources: newRes });
                                            }}
                                            className="h-8 text-sm"
                                        />
                                        <Input
                                            placeholder="URL (https://...)"
                                            value={res.url}
                                            onChange={e => {
                                                const newRes = [...formData.resources];
                                                newRes[index].url = e.target.value;
                                                setFormData({ ...formData, resources: newRes });
                                            }}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            const newRes = [...formData.resources];
                                            newRes.splice(index, 1);
                                            setFormData({ ...formData, resources: newRes });
                                        }}
                                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFormData({
                                    ...formData,
                                    resources: [...formData.resources, { label: "", url: "" }]
                                })}
                                className="w-full"
                            >
                                <Plus className="size-4 mr-2" />
                                Add Resource
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h3 className="font-bold text-lg">Excerpt</h3>
                        <div className="space-y-2">
                            <Label>Short Summary</Label>
                            <Textarea
                                value={formData.excerpt}
                                onChange={e => handleChange('excerpt', e.target.value)}
                                className="h-32"
                                placeholder="A short teast of what this post is about..."
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

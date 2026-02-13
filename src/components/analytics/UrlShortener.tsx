"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import { Link as LinkIcon, Copy, ExternalLink, BarChart3, Trash2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';

interface ShortUrl {
    id: string;
    shortCode: string;
    originalUrl: string;
    customAlias?: string;
    createdAt: any;
    enabled: boolean;
    clicks: number;
    metadata?: {
        title?: string;
        description?: string;
        tags?: string[];
    };
}

export default function UrlShortener() {
    const [urls, setUrls] = useState<ShortUrl[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Form state
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const functions = getFunctions(app);

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        setLoading(true);
        try {
            const listShortUrlsFn = httpsCallable(functions, 'listShortUrls');
            const result = await listShortUrlsFn({});
            const data = result.data as { urls: ShortUrl[] };
            setUrls(data.urls);
        } catch (error) {
            console.error('Failed to fetch URLs:', error);
            toast.error('Failed to load short URLs');
        }
        setLoading(false);
    };

    const createShortUrl = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!originalUrl) {
            toast.error('Please enter a URL');
            return;
        }

        setCreating(true);
        try {
            const createShortUrlFn = httpsCallable(functions, 'createShortUrl');
            const result = await createShortUrlFn({
                originalUrl,
                customAlias: customAlias || undefined,
                title: title || undefined,
                description: description || undefined
            });

            const data = result.data as { shortUrl: string };
            toast.success('Short URL created!');

            // Reset form
            setOriginalUrl('');
            setCustomAlias('');
            setTitle('');
            setDescription('');

            // Refresh list
            fetchUrls();
        } catch (error: any) {
            console.error('Failed to create short URL:', error);
            toast.error(error.message || 'Failed to create short URL');
        }
        setCreating(false);
    };

    const copyToClipboard = (shortCode: string) => {
        const shortUrl = `https://hub-snap.web.app/s/${shortCode}`;
        navigator.clipboard.writeText(shortUrl);
        toast.success('Copied to clipboard!');
    };

    const toggleEnabled = async (urlId: string, enabled: boolean) => {
        try {
            const updateShortUrlFn = httpsCallable(functions, 'updateShortUrl');
            await updateShortUrlFn({ urlId, enabled: !enabled });
            toast.success(enabled ? 'Short URL disabled' : 'Short URL enabled');
            fetchUrls();
        } catch (error) {
            console.error('Failed to toggle URL:', error);
            toast.error('Failed to update short URL');
        }
    };

    const deleteUrl = async (urlId: string) => {
        if (!confirm('Are you sure you want to delete this short URL?')) return;

        try {
            const deleteShortUrlFn = httpsCallable(functions, 'deleteShortUrl');
            await deleteShortUrlFn({ urlId });
            toast.success('Short URL deleted');
            fetchUrls();
        } catch (error) {
            console.error('Failed to delete URL:', error);
            toast.error('Failed to delete short URL');
        }
    };

    const viewAnalytics = (urlId: string) => {
        // TODO: Open analytics modal or navigate to analytics view
        toast.info('Analytics view coming soon');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">URL Shortener & Tracking</h2>

            {/* Create Short URL Form */}
            <Card className="p-6 border-slate-200">
                <h3 className="font-bold text-lg mb-4">Create Short URL</h3>
                <form onSubmit={createShortUrl} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Original URL *
                        </label>
                        <Input
                            type="url"
                            placeholder="https://example.com/long-url"
                            value={originalUrl}
                            onChange={(e) => setOriginalUrl(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Custom Alias (optional)
                        </label>
                        <Input
                            type="text"
                            placeholder="my-custom-link"
                            value={customAlias}
                            onChange={(e) => setCustomAlias(e.target.value)}
                            pattern="[a-zA-Z0-9_-]+"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Only letters, numbers, hyphens, and underscores
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Title (optional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Link title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description (optional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Link description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={creating}>
                        {creating ? 'Creating...' : 'Create Short URL'}
                    </Button>
                </form>
            </Card>

            {/* Short URLs List */}
            <Card className="border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">Your Short URLs</h3>
                        <Button onClick={fetchUrls} variant="outline" size="sm">
                            Refresh
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6">
                        <p className="text-slate-500">Loading...</p>
                    </div>
                ) : urls.length === 0 ? (
                    <div className="p-6">
                        <p className="text-slate-500">No short URLs created yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {urls.map((url) => (
                            <div key={url.id} className="p-6 hover:bg-slate-50">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LinkIcon className="size-4 text-slate-400 flex-shrink-0" />
                                            <code className="text-sm font-mono font-medium text-sky-600">
                                                hub-snap.web.app/s/{url.shortCode}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(url.shortCode)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <Copy className="size-4" />
                                            </button>
                                        </div>

                                        <p className="text-sm text-slate-600 truncate mb-1">
                                            → {url.originalUrl}
                                        </p>

                                        {url.metadata?.title && (
                                            <p className="text-sm font-medium text-slate-700 mb-1">
                                                {url.metadata.title}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                            <span>{url.clicks.toLocaleString()} clicks</span>
                                            <span>
                                                Created {new Date(url.createdAt.seconds * 1000).toLocaleDateString()}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded ${url.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {url.enabled ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            onClick={() => viewAnalytics(url.id)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <BarChart3 className="size-4" />
                                        </Button>

                                        <Button
                                            onClick={() => toggleEnabled(url.id, url.enabled)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {url.enabled ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                                        </Button>

                                        <Button
                                            onClick={() => deleteUrl(url.id)}
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

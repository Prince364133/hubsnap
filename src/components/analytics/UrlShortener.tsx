"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics/short-urls');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch URLs');
            }

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
            const response = await fetch('/api/analytics/short-urls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    longUrl: originalUrl,
                    customSlug: customAlias || undefined,
                    title: title || undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create short URL');
            }

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
            const response = await fetch('/api/analytics/short-urls', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: urlId, enabled: !enabled })
            });

            if (!response.ok) {
                throw new Error('Failed to update');
            }

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
            const response = await fetch(`/api/analytics/short-urls?id=${urlId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            toast.success('Short URL deleted');
            fetchUrls();
        } catch (error) {
            console.error('Failed to delete URL:', error);
            toast.error('Failed to delete short URL');
        }
    };

    const [analyticsUrl, setAnalyticsUrl] = useState<ShortUrl | null>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    const viewAnalytics = async (urlId: string) => {
        const url = urls.find(u => u.id === urlId);
        if (url) {
            setAnalyticsUrl(url);
            setLoadingAnalytics(true);

            try {
                const response = await fetch(`/api/analytics/url-analytics?urlId=${urlId}`);
                const data = await response.json();

                if (response.ok) {
                    setAnalyticsData(data);
                } else {
                    toast.error('Failed to load analytics');
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                toast.error('Failed to load analytics');
            } finally {
                setLoadingAnalytics(false);
            }
        }
    };

    const closeAnalytics = () => {
        setAnalyticsUrl(null);
        setAnalyticsData(null);
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

            {/* Analytics Modal */}
            {analyticsUrl && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">URL Analytics</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    hub-snap.web.app/s/{analyticsUrl.shortCode}
                                </p>
                            </div>
                            <button
                                onClick={closeAnalytics}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500">Total Clicks</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {analyticsUrl.clicks.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500">Status</p>
                                    <p className={`text-lg font-bold mt-1 ${analyticsUrl.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                        {analyticsUrl.enabled ? 'Active' : 'Disabled'}
                                    </p>
                                </div>
                            </div>

                            {/* URL Details */}
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Original URL</p>
                                    <p className="text-sm text-slate-600 break-all mt-1">{analyticsUrl.originalUrl}</p>
                                </div>

                                {analyticsUrl.metadata?.title && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Title</p>
                                        <p className="text-sm text-slate-600 mt-1">{analyticsUrl.metadata.title}</p>
                                    </div>
                                )}

                                {analyticsUrl.metadata?.description && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Description</p>
                                        <p className="text-sm text-slate-600 mt-1">{analyticsUrl.metadata.description}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-slate-700">Created</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {new Date(analyticsUrl.createdAt.seconds * 1000).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Advanced Analytics */}
                            {loadingAnalytics ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-500">Loading analytics...</p>
                                </div>
                            ) : analyticsData ? (
                                <div className="space-y-6">
                                    {/* Clicks Over Time */}
                                    <div>
                                        <h4 className="font-bold text-md mb-3">Clicks Over Time (Last 7 Days)</h4>
                                        <div className="flex items-end gap-2 h-32">
                                            {analyticsData.clicksOverTime.map((day: any, idx: number) => {
                                                const maxClicks = Math.max(...analyticsData.clicksOverTime.map((d: any) => d.count), 1);
                                                const height = (day.count / maxClicks) * 100;
                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                                        <div className="text-xs text-slate-600 font-medium">{day.count}</div>
                                                        <div
                                                            className="w-full bg-sky-500 rounded-t transition-all hover:bg-sky-600"
                                                            style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                                                        />
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Traffic Sources */}
                                    <div>
                                        <h4 className="font-bold text-md mb-3">Traffic Sources</h4>
                                        <div className="space-y-2">
                                            {Object.entries(analyticsData.clicksBySource)
                                                .sort(([, a]: any, [, b]: any) => b - a)
                                                .slice(0, 5)
                                                .map(([source, count]: any) => (
                                                    <div key={source} className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-medium text-slate-700 truncate">
                                                                    {source}
                                                                </span>
                                                                <span className="text-sm text-slate-600 ml-2">{count}</span>
                                                            </div>
                                                            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-blue-500 h-full transition-all"
                                                                    style={{ width: `${(count / analyticsData.totalClicks) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            {Object.keys(analyticsData.clicksBySource).length === 0 && (
                                                <p className="text-sm text-slate-500">No traffic sources yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Device & Browser Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Device Types */}
                                        <div>
                                            <h4 className="font-bold text-md mb-3">Device Types</h4>
                                            <div className="space-y-2">
                                                {Object.entries(analyticsData.clicksByDevice)
                                                    .sort(([, a]: any, [, b]: any) => b - a)
                                                    .map(([device, count]: any) => (
                                                        <div key={device} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                                            <span className="text-sm text-slate-700">{device}</span>
                                                            <span className="text-sm font-bold text-slate-900">{count}</span>
                                                        </div>
                                                    ))}
                                                {Object.keys(analyticsData.clicksByDevice).length === 0 && (
                                                    <p className="text-sm text-slate-500">No data yet</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Browsers */}
                                        <div>
                                            <h4 className="font-bold text-md mb-3">Browsers</h4>
                                            <div className="space-y-2">
                                                {Object.entries(analyticsData.clicksByBrowser)
                                                    .sort(([, a]: any, [, b]: any) => b - a)
                                                    .map(([browser, count]: any) => (
                                                        <div key={browser} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                                            <span className="text-sm text-slate-700">{browser}</span>
                                                            <span className="text-sm font-bold text-slate-900">{count}</span>
                                                        </div>
                                                    ))}
                                                {Object.keys(analyticsData.clicksByBrowser).length === 0 && (
                                                    <p className="text-sm text-slate-500">No data yet</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Geographic Data */}
                                    <div>
                                        <h4 className="font-bold text-md mb-3">Geographic Distribution</h4>
                                        <div className="space-y-2">
                                            {Object.entries(analyticsData.clicksByCountry)
                                                .sort(([, a]: any, [, b]: any) => b - a)
                                                .slice(0, 5)
                                                .map(([country, count]: any) => (
                                                    <div key={country} className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-medium text-slate-700">{country}</span>
                                                                <span className="text-sm text-slate-600">{count}</span>
                                                            </div>
                                                            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-green-500 h-full transition-all"
                                                                    style={{ width: `${(count / analyticsData.totalClicks) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            {Object.keys(analyticsData.clicksByCountry).length === 0 && (
                                                <p className="text-sm text-slate-500">No geographic data yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Clicks */}
                                    {analyticsData.recentClicks.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-md mb-3">Recent Clicks</h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {analyticsData.recentClicks.map((click: any, idx: number) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg text-xs">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium text-slate-700">{click.referrer}</span>
                                                            <span className="text-slate-500">
                                                                {new Date(click.timestamp.seconds * 1000).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-600">
                                                            <span>🌍 {click.country}</span>
                                                            <span>📱 {click.device}</span>
                                                            <span>🌐 {click.browser}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        📊 Click analytics will appear here once you start getting traffic!
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200">
                            <Button onClick={closeAnalytics} className="w-full">
                                Close
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

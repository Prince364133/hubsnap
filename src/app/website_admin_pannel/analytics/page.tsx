"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import RealTimeMetrics from '@/components/analytics/RealTimeMetrics';
import TrafficCharts from '@/components/analytics/TrafficCharts';
import PageAnalytics from '@/components/analytics/PageAnalytics';
import UrlShortener from '@/components/analytics/UrlShortener';
import DeviceLocationCharts from '@/components/analytics/DeviceLocationCharts';
import { Activity, TrendingUp, FileText, Link as LinkIcon, Globe } from 'lucide-react';

type Tab = 'overview' | 'pages' | 'shortener' | 'devices';

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const tabs = [
        { id: 'overview' as Tab, label: 'Overview', icon: Activity },
        { id: 'pages' as Tab, label: 'Pages', icon: FileText },
        { id: 'shortener' as Tab, label: 'URL Shortener', icon: LinkIcon },
        { id: 'devices' as Tab, label: 'Devices & Locations', icon: Globe }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics & Intelligence</h1>
                <p className="text-slate-600 mt-1">
                    Real-time insights, traffic analytics, and URL tracking
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                                    ${isActive
                                        ? 'border-sky-500 text-sky-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }
                                `}
                            >
                                <Icon className={`size-5 ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <RealTimeMetrics />
                        <TrafficCharts />
                    </div>
                )}

                {activeTab === 'pages' && <PageAnalytics />}

                {activeTab === 'shortener' && <UrlShortener />}

                {activeTab === 'devices' && <DeviceLocationCharts />}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

const DEVICE_COLORS = {
    mobile: '#0ea5e9',
    desktop: '#8b5cf6',
    tablet: '#f59e0b'
};

const BROWSER_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function DeviceLocationCharts() {
    const [deviceData, setDeviceData] = useState<any[]>([]);
    const [browserData, setBrowserData] = useState<any[]>([]);
    const [locationData, setLocationData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeviceLocationData();
    }, []);

    const fetchDeviceLocationData = async () => {
        setLoading(true);
        try {
            // Get last 7 days of data
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const eventsRef = collection(db, 'analytics_events');
            const q = query(
                eventsRef,
                where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => doc.data());

            // Aggregate device types
            const deviceCounts: { [key: string]: number } = { mobile: 0, desktop: 0, tablet: 0 };
            events.forEach((event: any) => {
                const deviceType = event.metadata?.deviceType || 'desktop';
                deviceCounts[deviceType]++;
            });

            setDeviceData([
                { name: 'Mobile', value: deviceCounts.mobile },
                { name: 'Desktop', value: deviceCounts.desktop },
                { name: 'Tablet', value: deviceCounts.tablet }
            ]);

            // Aggregate browsers
            const browserCounts: { [key: string]: number } = {};
            events.forEach((event: any) => {
                const browser = event.metadata?.browser || 'Unknown';
                browserCounts[browser] = (browserCounts[browser] || 0) + 1;
            });

            const topBrowsers = Object.entries(browserCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, value]) => ({ name, value }));

            setBrowserData(topBrowsers);

            // Aggregate locations
            const locationCounts: { [key: string]: number } = {};
            events.forEach((event: any) => {
                const country = event.metadata?.location?.country;
                if (country) {
                    locationCounts[country] = (locationCounts[country] || 0) + 1;
                }
            });

            const topLocations = Object.entries(locationCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, value]) => ({ name, value }));

            setLocationData(topLocations);
        } catch (error) {
            console.error('Failed to fetch device/location data:', error);
        }
        setLoading(false);
    };

    const totalDevices = deviceData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Device & Location Analytics</h2>

            {/* Device Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-slate-200">
                    <h3 className="font-bold text-lg mb-4">Device Types</h3>
                    {loading ? (
                        <p className="text-slate-500">Loading...</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={deviceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.name.toLowerCase() as keyof typeof DEVICE_COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="mt-4 space-y-2">
                                {deviceData.map((device) => (
                                    <div key={device.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {device.name === 'Mobile' && <Smartphone className="size-4 text-sky-500" />}
                                            {device.name === 'Desktop' && <Monitor className="size-4 text-purple-500" />}
                                            {device.name === 'Tablet' && <Tablet className="size-4 text-orange-500" />}
                                            <span className="text-sm text-slate-700">{device.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900">{device.value.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">
                                                {totalDevices > 0 ? ((device.value / totalDevices) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card>

                {/* Browser Distribution */}
                <Card className="p-6 border-slate-200">
                    <h3 className="font-bold text-lg mb-4">Top Browsers</h3>
                    {loading ? (
                        <p className="text-slate-500">Loading...</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={browserData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0ea5e9" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* Location Distribution */}
            <Card className="p-6 border-slate-200">
                <h3 className="font-bold text-lg mb-4">Top Locations</h3>
                {loading ? (
                    <p className="text-slate-500">Loading...</p>
                ) : locationData.length === 0 ? (
                    <p className="text-slate-500">No location data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                                        Country
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                                        Visitors
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {locationData.map((location, index) => {
                                    const total = locationData.reduce((sum, l) => sum + l.value, 0);
                                    const percentage = ((location.value / total) * 100).toFixed(1);

                                    return (
                                        <tr key={location.name}>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                {location.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {location.value.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-sky-500 h-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-600 w-12 text-right">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

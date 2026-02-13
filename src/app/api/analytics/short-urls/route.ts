import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = () => getFirestore(app);

// GET - List all short URLs
export async function GET(request: NextRequest) {
    try {
        const q = query(collection(db(), 'short_urls'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const urls = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ urls });
    } catch (error: any) {
        console.error('Failed to list short URLs:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to list short URLs' },
            { status: 500 }
        );
    }
}

// POST - Create new short URL
export async function POST(request: NextRequest) {
    try {
        const { longUrl, customSlug, title } = await request.json();

        if (!longUrl) {
            return NextResponse.json(
                { error: 'longUrl is required' },
                { status: 400 }
            );
        }

        // Generate slug if not provided
        const slug = customSlug || Math.random().toString(36).substring(2, 8);

        const shortUrlData = {
            longUrl,
            slug,
            title: title || '',
            clicks: 0,
            createdAt: Timestamp.now(),
            lastClicked: null
        };

        const docRef = await addDoc(collection(db(), 'short_urls'), shortUrlData);

        return NextResponse.json({
            id: docRef.id,
            ...shortUrlData,
            shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hub-snap.web.app'}/s/${slug}`
        });
    } catch (error: any) {
        console.error('Failed to create short URL:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create short URL' },
            { status: 500 }
        );
    }
}

// PUT - Update short URL
export async function PUT(request: NextRequest) {
    try {
        const { id, title, longUrl } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (longUrl !== undefined) updates.longUrl = longUrl;
        updates.updatedAt = Timestamp.now();

        const docRef = doc(db(), 'short_urls', id);
        await updateDoc(docRef, updates);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to update short URL:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update short URL' },
            { status: 500 }
        );
    }
}

// DELETE - Delete short URL
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        const docRef = doc(db(), 'short_urls', id);
        await deleteDoc(docRef);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete short URL:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete short URL' },
            { status: 500 }
        );
    }
}

import * as nodemailer from 'nodemailer';
import * as imap from 'imap-simple';
import { simpleParser } from 'mailparser';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// SMTP Configuration
// Retrieve from Environment Variables for security
const smtpConfig = {
    host: process.env.SMTP_HOST || 'mail.yourdomain.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    pool: true, // Use pooled connections
    maxConnections: 5,
    maxMessages: 100,
};

const transporter = nodemailer.createTransport(smtpConfig);

/**
 * Send an individual email via SMTP
 */
export async function sendEmailCore(to: string, subject: string, html: string, text?: string) {
    if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not set. Email simulation:');
        console.log(`To: ${to}, Subject: ${subject}`);
        return { messageId: 'simulated-id', response: 'Simulated success' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Support'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>?/gm, ''), // Simple fallback text
        });
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

/**
 * Fetch unwatched emails from IMAP inbox
 * Syncs replies to Firestore
 */
export async function syncInboxCore() {
    if (!process.env.IMAP_USER) {
        console.warn('IMAP_USER not set. Skipping sync.');
        return;
    }

    const config: imap.ImapSimpleOptions = {
        imap: {
            user: process.env.IMAP_USER,
            password: process.env.IMAP_PASS || '',
            host: process.env.IMAP_HOST || 'mail.yourdomain.com',
            port: parseInt(process.env.IMAP_PORT || '993'),
            tls: true,
            authTimeout: 3000,
        },
    };

    try {
        const connection = await imap.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: true,
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        for (const message of messages) {
            const all = message.parts.find((part: any) => part.which === 'TEXT');
            if (!all) continue;

            const id = message.attributes.uid;
            const idHeader = "Imap-Id: " + id + "\r\n";

            const simpleParsed = await simpleParser(idHeader + all.body);

            const from = simpleParsed.from?.text || 'Unknown';
            const subject = simpleParsed.subject || 'No Subject';
            const body = simpleParsed.text || simpleParsed.html || '';
            const date = simpleParsed.date || new Date();

            // Store in Firestore
            await db.collection('email_replies').add({
                from,
                subject,
                body,
                receivedAt: admin.firestore.Timestamp.fromDate(date),
                rawId: id,
                status: 'unread'
            });

            console.log(`synced email from ${from}`);
        }

        connection.end();
    } catch (error) {
        console.error('IMAP Error:', error);
    }
}

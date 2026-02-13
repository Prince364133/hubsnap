"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailCore = sendEmailCore;
exports.syncInboxCore = syncInboxCore;
const nodemailer = __importStar(require("nodemailer"));
const imap = __importStar(require("imap-simple"));
const mailparser_1 = require("mailparser");
const admin = __importStar(require("firebase-admin"));
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
async function sendEmailCore(to, subject, html, text) {
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
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
/**
 * Fetch unwatched emails from IMAP inbox
 * Syncs replies to Firestore
 */
async function syncInboxCore() {
    var _a;
    if (!process.env.IMAP_USER) {
        console.warn('IMAP_USER not set. Skipping sync.');
        return;
    }
    const config = {
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
            const all = message.parts.find((part) => part.which === 'TEXT');
            if (!all)
                continue;
            const id = message.attributes.uid;
            const idHeader = "Imap-Id: " + id + "\r\n";
            const simpleParsed = await (0, mailparser_1.simpleParser)(idHeader + all.body);
            const from = ((_a = simpleParsed.from) === null || _a === void 0 ? void 0 : _a.text) || 'Unknown';
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
    }
    catch (error) {
        console.error('IMAP Error:', error);
    }
}
//# sourceMappingURL=email-core.js.map
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
exports.onUserCreated = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * On User Created -> Send Welcome Email
 */
exports.onUserCreated = functions.firestore.onDocumentCreated('users/{userId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const user = snapshot.data();
    const userId = event.params.userId;
    const email = user.email;
    const name = user.name || 'Creator';
    if (!email) {
        console.log(`User ${userId} has no email. Skipping welcome email.`);
        return;
    }
    // 1. Fetch Welcome Template
    // In a real app, fetch from 'email_templates' collection.
    // Here we use a hardcoded fallback or fetch.
    let subject = 'Welcome to CreatorOS!';
    let html = `<h1>Welcome, ${name}!</h1><p>We are excited to have you on board.</p>`;
    try {
        const templateDoc = await db.collection('email_templates').doc('welcome-email').get();
        if (templateDoc.exists) {
            const template = templateDoc.data();
            subject = (template === null || template === void 0 ? void 0 : template.subject) || subject;
            html = (template === null || template === void 0 ? void 0 : template.bodyHtml) || html;
            // Simple variable substitution
            html = html.replace(/{{name}}/g, name).replace(/{{email}}/g, email);
        }
    }
    catch (e) {
        console.warn('Failed to fetch welcome template, using default.', e);
    }
    // 2. Add to Email Queue
    await db.collection('email_queue').add({
        to: email,
        subject: subject,
        html: html,
        status: 'pending',
        priority: 1, // High priority
        createdAt: admin.firestore.Timestamp.now(),
        retryCount: 0,
        metadata: {
            userId,
            trigger: 'signup'
        }
    });
    console.log(`Enqueued welcome email for ${email}`);
});
//# sourceMappingURL=email-automation.js.map
const { onRequest } = require('firebase-functions/v2/https');
const next = require('next');

process.env.NODE_ENV = 'production';

const dev = false;
const dir = __dirname;
const port = process.env.PORT || 3000;

// Config extracted from standalone server.js
const nextConfig = { "env": {}, "webpack": null, "typescript": { "ignoreBuildErrors": false }, "typedRoutes": false, "distDir": "./.next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 14400, "formats": ["image/webp"], "maximumRedirects": 3, "maximumResponseBody": 50000000, "dangerouslyAllowLocalIP": false, "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "localPatterns": [{ "pathname": "**", "search": "" }], "remotePatterns": [{ "protocol": "https", "hostname": "images.unsplash.com" }], "qualities": [75], "unoptimized": false }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 60000, "pagesBufferLength": 5 }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6000, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": {}, "expireTime": 31536000, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "C:\\Users\\Windows-10\\OneDrive\\Desktop\\HubSnap\\HubSnap", "cacheComponents": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592000 }, "max": { "stale": 300, "revalidate": 2592000, "expire": 31536000 } }, "cacheHandlers": {}, "experimental": { "useSkewCookie": false, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "proxyPrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 3, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptSkipMetadata": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128000, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "reactDebugChannel": false, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "transitionIndicator": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "browserDebugInfoInTerminal": false, "lockDistDir": true, "isolatedDevBuild": true, "proxyClientMaxBodySize": 10485760, "hideLogsAfterAbort": false, "mcpServer": true, "turbopackFileSystemCacheForDev": true, "turbopackFileSystemCacheForBuild": false, "turbopackInferModuleSideEffects": false, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "turbopack": { "root": "C:\\Users\\Windows-10\\OneDrive\\Desktop\\HubSnap\\HubSnap" }, "distDirRoot": ".next" };

const app = next({
    dev,
    dir,
    conf: nextConfig
});

const handle = app.getRequestHandler();

// ============================================
// NEXT.JS SSR FUNCTION
// ============================================
exports.ssrhubsnap = onRequest({
    region: "us-central1",
    memory: "2GiB",
    timeoutSeconds: 540,
    maxInstances: 10
}, (req, res) => {
    return app.prepare().then(() => handle(req, res));
});

// ============================================
// ANALYTICS FUNCTIONS
// ============================================
const analytics = require('./lib/analytics');
exports.trackEvent = analytics.trackEvent;
exports.startSession = analytics.startSession;
exports.endSession = analytics.endSession;
exports.trackPageView = analytics.trackPageView;
exports.getActiveUsers = analytics.getActiveUsers;
exports.aggregateDailyStats = analytics.aggregateDailyStats;
exports.cleanupOldEvents = analytics.cleanupOldEvents;

// ============================================
// URL SHORTENER FUNCTIONS
// ============================================
const shortener = require('./lib/shortener');
exports.createShortUrl = shortener.createShortUrl;
exports.listShortUrls = shortener.listShortUrls;
exports.updateShortUrl = shortener.updateShortUrl;
exports.deleteShortUrl = shortener.deleteShortUrl;
exports.getShortUrlStats = shortener.getShortUrlStats;
exports.redirectShortUrl = shortener.redirectShortUrl;
exports.cleanupExpiredUrls = shortener.cleanupExpiredUrls;
exports.processUrlAnalytics = shortener.processUrlAnalytics;
exports.getUrlAnalytics = shortener.getUrlAnalytics;

// ============================================
// USER ANALYTICS FUNCTIONS
// ============================================
const userAnalytics = require('./lib/user-analytics');
exports.aggregateUserActivity = userAnalytics.aggregateUserActivity;
exports.updateAdminStats = userAnalytics.updateAdminStats;
exports.getUserActivityTimeline = userAnalytics.getUserActivityTimeline;

// ============================================
// BULK OPERATIONS FUNCTIONS
// ============================================
const bulkOps = require('./lib/bulk-operations');
exports.batchUpdateUsers = bulkOps.batchUpdateUsers;
exports.sendBulkEmail = bulkOps.sendBulkEmail;
exports.exportUsers = bulkOps.exportUsers;
exports.scheduledExport = bulkOps.scheduledExport;
exports.cleanupOldExports = bulkOps.cleanupOldExports;
exports.processEmailQueue = bulkOps.processEmailQueue;

// ============================================
// DASHBOARD STATS
// ============================================
const dashboardStats = require('./lib/dashboard-stats');
exports.aggregateDashboardStats = dashboardStats.aggregateDashboardStats;

// ============================================
// EMAIL SYSTEM (MAILCOW BACKEND)
// ============================================
const emailWorker = require('./lib/email-worker');
const emailAutomation = require('./lib/email-automation');
const emailCampaigns = require('./lib/email-campaigns');

exports.processEmailQueueWorker = emailWorker.processEmailQueueWorker;
exports.onUserCreated = emailAutomation.onUserCreated;
exports.onContactMessageCreated = emailAutomation.onContactMessageCreated;
exports.createCampaign = emailCampaigns.createCampaign;

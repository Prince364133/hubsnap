// YouTube Service - Disabled
// This service is currently disabled and will be re-enabled in a future update

export interface YouTubeStats {
    subscriberCount: string;
    viewCount: string;
    videoCount: string;
    customUrl: string;
    thumbnailUrl: string;
    title: string;
}

export const youtubeService = {
    getAuthUrl: () => {
        return "";
    },

    getChannelStats: async (accessToken: string): Promise<YouTubeStats | null> => {
        console.warn("YouTube integration is currently disabled");
        return null;
    }
};

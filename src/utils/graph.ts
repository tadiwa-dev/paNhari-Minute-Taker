import { ILogger } from "@microsoft/teams.common";
import { ManagedIdentityCredential } from "@azure/identity";
export interface TranscriptContent {
    content: string;
    meetingId: string;
    transcriptId: string;
}

export class GraphClient {
    private appId: string;
    private appPassword: string;
    private tenantId: string;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(private logger: ILogger) {
        this.appId = process.env.MicrosoftAppId || process.env.BOT_ID || process.env.CLIENT_ID || "";
        this.appPassword = process.env.MicrosoftAppPassword || process.env.SECRET_BOT_PASSWORD || process.env.CLIENT_SECRET || "";
        this.tenantId = process.env.TENANT_ID || process.env.TEAMS_APP_TENANT_ID || "";

        const isMsi = process.env.BOT_TYPE === "UserAssignedMsi";

        if (!isMsi && (!this.appId || !this.appPassword || !this.tenantId)) {
            this.logger.error("❌ GraphClient: Missing required environment variables (AppId, AppPassword, or TenantId) for standard OAuth");
        }
    }

    private async getAccessToken(): Promise<string> {
        const now = Date.now();
        if (this.accessToken && now < this.tokenExpiry) {
            return this.accessToken;
        }

        this.logger.debug("🌐 GraphClient: Fetching new access token...");

        if (process.env.BOT_TYPE === "UserAssignedMsi") {
            try {
                this.logger.debug("🌐 GraphClient: Using User-Assigned Managed Identity...");
                const managedIdentityCredential = new ManagedIdentityCredential({
                    clientId: this.appId || process.env.CLIENT_ID,
                });
                
                const tokenResponse = await managedIdentityCredential.getToken("https://graph.microsoft.com/.default", {
                    tenantId: this.tenantId || process.env.TENANT_ID,
                });
                
                this.accessToken = tokenResponse.token;
                this.tokenExpiry = tokenResponse.expiresOnTimestamp;
                
                return this.accessToken;
            } catch (error) {
                this.logger.error(`❌ GraphClient: Failed to get Managed Identity token: ${error}`);
                throw new Error(`GraphClient: Failed to get Managed Identity token: ${error}`);
            }
        }

        const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.appId,
            client_secret: this.appPassword,
            scope: "https://graph.microsoft.com/.default",
        });

        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        const data = await response.json() as any;

        if (!data.access_token) {
            throw new Error(`GraphClient: Failed to get OAuth token: ${data.error} - ${data.error_description}`);
        }

        this.accessToken = data.access_token;
        // Buffer of 5 minutes before actual expiry
        this.tokenExpiry = now + (data.expires_in * 1000) - (5 * 60 * 1000);

        return this.accessToken!;
    }

    async getMeetingTranscripts(meetingId: string): Promise<any[]> {
        const token = await this.getAccessToken();
        const url = `https://graph.microsoft.com/v1.0/onlineMeetings/${meetingId}/transcripts`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            this.logger.error(`❌ GraphClient: Failed to fetch transcripts for meeting ${meetingId}: ${error}`);
            return [];
        }

        const data = await response.json() as any;
        return data.value || [];
    }

    async getTranscriptContent(meetingId: string, transcriptId: string): Promise<string | null> {
        const token = await this.getAccessToken();
        const url = `https://graph.microsoft.com/v1.0/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            this.logger.error(`❌ GraphClient: Failed to fetch transcript content for ${transcriptId}: ${error}`);
            return null;
        }

        return await response.text();
    }

    /**
     * Helper to get the most recent transcript for a meeting
     */
    async getLatestTranscriptContent(meetingId: string): Promise<string | null> {
        try {
            this.logger.debug(`🌐 GraphClient: Looking for transcripts for meeting ${meetingId}`);
            const transcripts = await this.getMeetingTranscripts(meetingId);

            if (transcripts.length === 0) {
                this.logger.warn(`⚠️ GraphClient: No transcripts found for meeting ${meetingId}`);
                return null;
            }

            // Sort by createdDateTime descending
            const latestTranscript = transcripts.sort((a, b) =>
                new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime()
            )[0];

            this.logger.debug(`🌐 GraphClient: Fetching content for transcript ${latestTranscript.id}`);
            return await this.getTranscriptContent(meetingId, latestTranscript.id);
        } catch (error) {
            this.logger.error(`❌ GraphClient: Error in getLatestTranscriptContent: ${error}`);
            return null;
        }
    }
}

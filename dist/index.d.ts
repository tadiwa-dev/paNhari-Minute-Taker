import { App } from '@microsoft/teams.apps';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import { Message } from '@microsoft/teams.ai';

interface MessageRecordExtension {
    id?: number;
    conversation_id?: string;
    content: string;
    name: string;
    timestamp: string;
    activity_id?: string;
}
type MessageRecord = Message & MessageRecordExtension;

/**
 * Abstract database interface that both SQLite and MSSQL implementations follow
 */
interface IDatabase {
    initialize(): Promise<void>;
    clearAll(): void | Promise<void>;
    get(conversationId: string): MessageRecord[] | Promise<MessageRecord[]>;
    getMessagesByTimeRange(conversationId: string, startTime: string, endTime: string): MessageRecord[] | Promise<MessageRecord[]>;
    getRecentMessages(conversationId: string, limit?: number): MessageRecord[] | Promise<MessageRecord[]>;
    clearConversation(conversationId: string): void | Promise<void>;
    addMessages(messages: MessageRecord[]): void | Promise<void>;
    countMessages(conversationId: string): number | Promise<number>;
    clearAllMessages(): void | Promise<void>;
    getFilteredMessages(conversationId: string, keywords: string[], startTime: string, endTime: string, participants?: string[], maxResults?: number): MessageRecord[] | Promise<MessageRecord[]>;
    recordFeedback(replyToId: string, reaction: "like" | "dislike" | string, feedbackJson?: unknown): boolean | Promise<boolean>;
    close(): void | Promise<void>;
}

declare const app: App<DevtoolsPlugin>;
declare function initializeStorage(): Promise<IDatabase>;

export { app, app as default, initializeStorage };

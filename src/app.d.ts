// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			db: import('$lib/server/db').Database;
			user: import('$lib/server/auth/session').SessionValidationResult['user'];
			session: import('$lib/server/auth/session').SessionValidationResult['session'];
		}
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}

	interface Window {
		ai: WindowOrWorkerGlobalScope['ai'];
	}
}

export {};

// AI types

interface WindowOrWorkerGlobalScope {
	readonly ai: AI;
}

interface AI {
	readonly languageModel: AILanguageModelFactory;
}

interface AICreateMonitor extends EventTarget {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ondownloadprogress: ((this: AICreateMonitor, ev: Event) => any) | null;
}

type AICreateMonitorCallback = (monitor: AICreateMonitor) => void;

type AICapabilityAvailability = 'readily' | 'after-download' | 'no';

interface AILanguageModelFactory {
	create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
	capabilities(): Promise<AILanguageModelCapabilities>;
}

interface AILanguageModel extends EventTarget {
	prompt(
		input: AILanguageModelPromptInput,
		options?: AILanguageModelPromptOptions
	): Promise<string>;

	promptStreaming(
		input: AILanguageModelPromptInput,
		options?: AILanguageModelPromptOptions
	): ReadableStream;

	countPromptTokens(
		input: AILanguageModelPromptInput,
		options?: AILanguageModelPromptOptions
	): Promise<number>;

	readonly maxTokens: number;
	readonly tokensSoFar: number;
	readonly tokensLeft: number;

	readonly topK: number;
	readonly temperature: number;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	oncontextoverflow: ((this: AILanguageModel, ev: Event) => any) | null;

	clone(options?: AILanguageModelCloneOptions): Promise<AILanguageModel>;
	destroy(): void;
}

interface AILanguageModelCapabilities {
	readonly available: AICapabilityAvailability;
	languageAvailable(languageTag: string): AICapabilityAvailability;

	readonly defaultTopK: number | null;
	readonly maxTopK: number | null;
	readonly defaultTemperature: number | null;
	readonly maxTemperature: number | null;
}

interface AILanguageModelCreateOptions {
	signal?: AbortSignal;
	monitor?: AICreateMonitorCallback;

	systemPrompt?: string;
	initialPrompts?: AILanguageModelInitialPrompt[];
	topK?: number;
	temperature?: number;
}

interface AILanguageModelInitialPrompt {
	role: AILanguageModelInitialPromptRole;
	content: string;
}

interface AILanguageModelPrompt {
	role: AILanguageModelPromptRole;
	content: string;
}

interface AILanguageModelPromptOptions {
	signal?: AbortSignal;
}

interface AILanguageModelCloneOptions {
	signal?: AbortSignal;
}

type AILanguageModelPromptInput = string | AILanguageModelPrompt | AILanguageModelPrompt[];

type AILanguageModelInitialPromptRole = 'system' | 'user' | 'assistant';
type AILanguageModelPromptRole = 'user' | 'assistant';

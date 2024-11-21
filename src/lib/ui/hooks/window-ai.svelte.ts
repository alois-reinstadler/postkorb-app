import { getContext, setContext, untrack } from 'svelte';

export type AISession = Awaited<ReturnType<typeof window.ai.languageModel.create>>;
export type AISessionParams = Parameters<typeof window.ai.languageModel.create>;

export class AI {
	#ready = $state<boolean>(false);
	#session = $state<AISession>();

	constructor(...args: AISessionParams) {
		$effect(() => {
			return untrack(() => {
				const run = async () => {
					if (this.#session) this.#ready = true;
					if ('ai' in window)
						this.#ready = (await window.ai.languageModel.capabilities())?.available === 'readily';
					else this.#ready = false;

					console.log('window.ai: ' + this.#ready ? 'ready' : 'not ready');
				};

				run();

				return () => {
					this.#session?.destroy();
				};
			});
		});

		$effect(() => {
			const run = async () => {
				if (this.#ready) this.#session = await window.ai.languageModel.create(...args);
			};

			run();
		});
	}

	get ready() {
		return this.#ready;
	}

	get session() {
		return this.#session;
	}
}

const SYMBOL_KEY = 'window-ai-svelte';

export function setAI(...args: AISessionParams) {
	return setContext(Symbol.for(SYMBOL_KEY), new AI(...args));
}

export function useAI(): ReturnType<typeof setAI> {
	return getContext(Symbol.for(SYMBOL_KEY));
}

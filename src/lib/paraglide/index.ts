import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { i18n } from '$lib/i18n';
import * as m from '$lib/paraglide/messages';

import type { AvailableLanguageTag } from '$lib/paraglide/runtime';

export function switchLanguage(newLanguage: AvailableLanguageTag) {
	page.subscribe(($page) => {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	})();
}

export { m };

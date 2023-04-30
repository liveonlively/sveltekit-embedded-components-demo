import Counter from '$lib/../routes/(app)/Counter.svelte';
import Header from '$lib/../routes/(app)/Header.svelte';

const components = {
	Counter,
	Header,
};

if (typeof window !== 'undefined') {
	window['admin_components'] = components;
}

export default components;

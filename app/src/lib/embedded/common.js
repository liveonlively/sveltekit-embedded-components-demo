import Counter from '$lib/../routes/(app)/Counter.svelte';

const components = {
	Counter,
};

if (typeof window !== 'undefined') {
	window['common_components'] = components;
}

export default components;

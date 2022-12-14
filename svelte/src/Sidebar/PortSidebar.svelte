<script lang="ts">
	export let port: Port;
	export let portType: string;

	console.log(port);
</script>

<h1 class="text-center text-4xl my-2">{port.name}</h1>
<h4 class="text-3xl mb-2">Type: {portType === 'op' ? 'Output Port' : 'Input Port'}</h4>
<h4 class="text-3xl mb-2">Protocol: {port.protocol}</h4>
<h4 class="text-3xl mb-2">
	{port.location.startsWith('!local') ? '' : `Location: ${port.location}`}
</h4>

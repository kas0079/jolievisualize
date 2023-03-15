<script lang="ts">
	import { error } from './lib/error';
	import { vscode } from './lib/data';

	const reload = () => {
		if (!vscode) {
			location.reload();
			return;
		}
		vscode.postMessage({
			command: 'reload'
		});
	};
</script>

<div
	class="flex top-0 left-0 w-screen h-screen justify-center items-center"
	style="background-color: rgba(0, 18, 25, 0.5)"
>
	<div class="bg-gray-600 p-10 rounded-md relative w-10/12 lg:w-auto">
		<h1 class="border-l-4 border-red-500 rounded-md p-2 text-white">
			Parsing error has occured. Check the Jolie code and make sure it is correct. {#if $error.file}Also
				make sure that the <code
					>{$error.file.path.substring($error.file.path.lastIndexOf('/') + 1)}</code
				> file is correctly set up.
			{/if}
		</h1>

		<svg
			class="absolute left-2/4 -translate-x-1/2 bg-gray-600 p-1 -top-6 rounded-full fill-white cursor-pointer hover:fill-slate-500"
			xmlns="http://www.w3.org/2000/svg"
			width="54"
			height="54"
			viewBox="0 0 48 48"
			on:click={reload}
			on:keydown={reload}
		>
			<path
				d="M35.3 12.7c-2.89-2.9-6.88-4.7-11.3-4.7-8.84 0-15.98 7.16-15.98 16s7.14 16 15.98 16c7.45 0 13.69-5.1 15.46-12h-4.16c-1.65 4.66-6.07 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.31 0 6.28 1.38 8.45 3.55l-6.45 6.45h14v-14l-4.7 4.7z"
			/>
			<path d="M0 0h48v48h-48z" fill="none" />
		</svg>
	</div>
</div>

<script>
	export let contrastThemes = [
		'Change Theme',
		'Black/White',
		'Yellow/Black',
		'Black/Yellow',
		'Black/Green',
		'Blue/Yellow',
		'Yellow/Blue',
		'Grayscale',
		'Black/Pink',
		'Custom'
	];
	export let corner = 'NE';
	export let bgColor = null;
	export let textColor = null;
	export let nodeColor = null;
	export let edgeColor = null;
	let current = contrastThemes[0];
	let isCustomTheme = false;
	function changeTheme(event) {
		const selectedTheme = event.target.value;
		if (selectedTheme === 'Custom') {
			isCustomTheme = true;
		} else {
			isCustomTheme = false;
			bgColor = null;
			textColor = null;
			nodeColor = null;
			edgeColor = null;
			current = selectedTheme;
			document.documentElement.setAttribute('svelvet-theme', selectedTheme);
			updateCustomTheme();
		}
		localStorage.setItem('currentTheme', current);
	}
	function updateCustomTheme() {
		document.documentElement.style.setProperty('--default-background-color', bgColor);
		document.documentElement.style.setProperty('--default-text-color', textColor);
		document.documentElement.style.setProperty('--default-node-color', nodeColor);
		document.documentElement.style.setProperty('--default-edge-color', edgeColor);
	}
</script>

<div class="contrast-wrapper" class:NE={corner === 'NE'} on:input={updateCustomTheme}>
	<label for="themeSelector" class="visually-hidden" aria-hidden="true">Select Theme:</label>
	<select id="themeSelector" on:change={changeTheme} aria-live="polite" aria-label="Select Theme">
		{#each contrastThemes as contrast (contrast)}
			<option value={contrast} aria-selected={current === contrast}>{contrast}</option>
		{/each}
	</select>

	{#if isCustomTheme}
		<div>
			<label for="customBgColor">BackGround</label>
			<input type="color" id="customBgColor" bind:value={bgColor} />
		</div>
		<div>
			<label for="customTextColor">Text</label>
			<input type="color" id="customTextColor" bind:value={textColor} />
		</div>
		<div>
			<!-- changed to customNodeColor from customTextColor -->

			<label for="customNodeColor">Node</label>
			<input type="color" id="customNodeColor" bind:value={nodeColor} />
		</div>
		<div>
			<!-- changed to CustomEdgeColor from customTextColor -->
			<label for="customEdgeColor">Edge</label>
			<input type="color" id="customEdgeColor" bind:value={edgeColor} />
		</div>
		<button
			on:click={() => {
				isCustomTheme = false;
				current = contrastThemes[0];
				document.documentElement.setAttribute('svelvet-theme', current);
				let themeSelector = document.getElementById('themeSelector');
				if (themeSelector) {
					themeSelector.value = current;
				}
			}}>Close</button
		>
	{/if}
</div>

<style>
	.NE {
		right: 52px;
		top: 10px;
	}
	.contrast-wrapper {
		position: absolute;
		display: flex;
		width: 1.5rem;
		flex-direction: column;
		border-radius: 6px;
		overflow: hidden;
		padding: 4px;
		width: fit-content;
		height: fit-content;
		cursor: pointer;
		box-shadow: var(--theme-toggle-shadow, var(--default-theme-toggle-shadow));
		border: solid 1px var(--theme-toggle-border, var(--default-theme-toggle-border));
		color: var(
			--prop-theme-toggle-text-color,
			var(--theme-toggle-text-color, var(--default-theme-toggle-text-color))
		);
		background-color: var(
			--prop-theme-toggle-color,
			var(--theme-toggle-color, var(--default-theme-toggle-color))
		);
	}

	select {
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.2rem 0;
		color: inherit;
		height: 1.6rem;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	label {
		margin-bottom: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		font-size: 14px;
		letter-spacing: 1px;
	}

	input[type='color'] {
		border: none;
		padding: 0;
		width: 100%;
		height: 30px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
		transition: transform 0.3s ease-in-out;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	input[type='color']::-webkit-color-swatch {
		border: none;
	}

	input[type='color']:hover {
		transform: scale(1.05);
	}

	button {
		background-color: #ffffff;
		border: none;
		color: #333;
		cursor: pointer;
		font-size: 14px;
		padding: 8px 16px;
		border-radius: 4px;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #e0e0e0;
	}
</style>

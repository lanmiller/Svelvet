<script context="module" lang="ts">
	// console.log('Drawer Mounted from DrawerNode');
	import { writable } from 'svelte/store';
	import type {
		NodeDrawerConfig,
		AnchorDrawerConfig,
		EdgeDrawerConfig,
		CSSColorString,
		NodeProps
	} from '$lib/types';
	import { addProps } from '$lib/utils';
	import { getSnappedPosition } from '$lib/utils/snapGrid';

	// External stores
	export const defaultNodePropsStore = writable<Array<NodeDrawerConfig>>([]);

	// Node properties
	let nodeProps: Partial<NodeDrawerConfig> = {
		width: 200,
		height: 100,
		x: 0,
		y: 0
	};

	// types for node creation
	let bgColor: CSSColorString | undefined;
	let borderColor: CSSColorString | undefined;
	let label: string | undefined;
	let width = 200;
	let height = 100;
	let locked: boolean | undefined;
	let center: boolean | undefined;
	let inputs: number | undefined;
	let outputs: number | undefined;
	let rotation: number | undefined;
	let zIndex: number | undefined;
	let TD: boolean | undefined;
	let LR: boolean | undefined;
	let useDefaults: boolean | undefined;
	let nodeDirection: string | undefined;
	let x = 0;
	let y = 0;

	// Creates props and adds to customNodePropsStore if an anchor was created, defaultNodePropsStore if not
	// Updated by team v.11.0 to test the store is being propertly updated
	export const createNodeProps = (
		edgeProps?: EdgeDrawerConfig,
		anchorProps?: { [key: string]: AnchorDrawerConfig[] }
	): any => {
		//Snap node position to grid
		const snappedPosition = getSnappedPosition(x, y);
		x = snappedPosition.x;
		y = snappedPosition.y;
		// Object that stores properties for the created node
		const nodeProps: NodeDrawerConfig = { x, y };
		// Array of property names and values for node
		const nodePropNames: string[] = [
			'bgColor',
			'borderColor',
			'label',
			'width',
			'height',
			'locked',
			'center',
			'inputs',
			'outputs',
			'rotation',
			'zIndex',
			'TD',
			'LR',
			'useDefaults'
		];
		const nodePropsArray: NodeProps = [
			bgColor,
			borderColor,
			label,
			width,
			height,
			locked,
			center,
			inputs,
			outputs,
			rotation,
			zIndex,
			TD,
			LR,
			useDefaults
		];

		// Add props to node if they exist
		addProps(nodePropNames, nodePropsArray, nodeProps);
		console.log('Nodo antes de props insertado', nodeProps);
		if (anchorProps) nodeProps.anchors = anchorProps;
		if (edgeProps) nodeProps.edgeProps = edgeProps;
		console.log('Nodo despues de props insertado', nodeProps);
		// defaultNodePropsStore.update((nodes) => [...nodes, nodeProps]);
		defaultNodePropsStore.update((nodes) => {
			const updatedNodes = [...nodes, nodeProps];
			/**Este log prueba que el store se esta aactualizando correctamente
			 * cada vez que se crea un nodo, se agrega al store array de nodos*/
			console.log('updated store:', updatedNodes); // Verifica el contenido del store
			return updatedNodes;
		});

		return nodeProps;
	};

	// Button clicks for defaultNodes
	const handleNodeResetButtonClick = (e: Event) => {
		bgColor = undefined;
		borderColor = undefined;
		label = undefined;
		width = 200;
		height = 100;
		inputs = undefined;
		outputs = undefined;
		locked = undefined;
		center = undefined;
		rotation = undefined;
		zIndex = undefined;
		TD = undefined;
		LR = undefined;
		useDefaults = undefined;
		x = 0;
		y = 0;

		const formElement = e.currentTarget as HTMLFormElement;
		formElement.reset();
	};

	const handleLockedButtonClick = (e: Event) => {
		const target = e.target as HTMLInputElement;
		locked = target.checked;
	};

	const handleCenterButtonClick = (e: Event) => {
		const target = e.target as HTMLInputElement;
		center = target.checked;
	};

	const handleUseDefaultsButtonClick = (e: Event) => {
		const target = e.target as HTMLInputElement;
		useDefaults = target.checked;
	};

	const handleAnchorPositionButton = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.value == '') nodeDirection = undefined;
		else {
			nodeDirection = target.value;
			if (nodeDirection === 'LR') {
				LR = true;
				TD = false;
			} else {
				TD = true;
				LR = false;
			}
		}
	};
</script>

<div id="nodeContainer">
	<!-- On submit resets all the values on the input field in the form to default -->
	<form on:submit|preventDefault={handleNodeResetButtonClick}>
		<ul aria-labelledby="select_props">
			<li class="list-item">
				<label for="bgColor">Background: </label>
				<input id="bgColor" class="colorWheel" type="color" bind:value={bgColor} />
			</li>
			<li class="list-item">
				<label for="borderColor">Border: </label>
				<input id="borderColor" class="colorWheel" type="color" bind:value={borderColor} />
			</li>
			<!-- <li class="list-item">
				<label for="useDefaults">useDefaults: </label>
				<input
					id="useDefaults"
					type="checkbox"
					bind:value={useDefaults}
					on:change={handleUseDefaultsButtonClick}
				/>
			</li> -->

			<li class="list-item">
				<label for="dimensions">Dimensions:</label>
			</li>
			<li class="list-item">
				<label for="width">Width:</label>
				<input id="width" class="inputField" type="input" bind:value={width} />
				<label for="height" style="margin-left: 6px">Height:</label>
				<input id="height" class="inputField" type="input" bind:value={height} />
			</li>
			<li class="list-item">
				<label for="locked">Locked: </label>
				<input id="label" type="checkbox" bind:value={locked} on:change={handleLockedButtonClick} />
			</li>
			<li class="list-item">
				<label for="centered">Centered: </label>
				<input
					id="centered"
					type="checkbox"
					bind:value={center}
					on:change={handleCenterButtonClick}
				/>
			</li>
			<li class="list-item">
				<label for="rotation">Rotation:</label>
				<input id="rotation" class="inputField" type="number" bind:value={rotation} />
			</li>
			<li class="list-item">
				<label for="zIndex">zIndex:</label>
				<input id="zIndex" class="inputField" type="number" bind:value={zIndex} />
			</li>
			<li class="list-item">
				<label for="label">Label : </label>
				<input id="label" type="text" bind:value={label} />
			</li>
			<li class="list-item">
				<label for="defaultAnchors">Default Anchors:</label>
			</li>
			<li class="list-item">
				<label for="inputAnchor">Input: </label>
				<input id="inputAnchor" class="inputField" type="number" min="0" bind:value={inputs} />
				<label for="outputAnchor" style="margin-left: 6px">Output: </label>
				<input id="outputAnchor" class="inputField" type="number" min="0" bind:value={outputs} />
			</li>
			<li class="list-item">
				<label for="anchorPositon">Anchor Position: </label>
				<select
					id="anchorPosition"
					bind:value={nodeDirection}
					on:change={handleAnchorPositionButton}
				>
					<option value="">-</option>
					<option value="LR">LR</option>
					<option value="TD">TD</option>
				</select>
			</li>
			<li class="list-item">
				<button class="nodeResetBtn btn" aria-label="Reset">Reset</button>
			</li>
		</ul>
	</form>
</div>

<style>
	/* Node dropdown Styling */
	#nodeContainer {
		width: 100%;
		font-size: 15px;
	}
	#nodeContainer ul {
		margin: 0;
		padding: 0;
	}
	label {
		margin-right: 10px;
	}

	.list-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		list-style: none;
		margin-bottom: 10px;
		margin-right: 3px;
	}
	.colorWheel {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background-color: transparent;
		border: none;
		width: 35px;
		height: 35px;
		cursor: pointer;
		border-radius: 50%;
	}
	.colorWheel::-webkit-color-swatch {
		border-radius: 40%;
	}
	.colorWheel::-moz-color-swatch {
		border-radius: 40%;
	}

	.inputField {
		width: 50px;
	}
	.btn {
		width: 120px;
		color: aliceblue;
		padding: 8px 20px;
		margin: auto;
		margin-top: 10px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 15px;
		margin-left: 70px;
	}
	.nodeResetBtn {
		color: var(
			--prop-drawer-reset-button-text-color,
			var(--drawer-reset-button-text-color, var(--default-reset-drawer-button-text-color))
		);
		background-color: var(
			--prop-drawer-reset-button-color,
			var(--drawer-reset-button-color, var(--default-drawer-reset-button-color))
		);
		box-shadow: 0 0 0 var(--final-border-width) var(--final-border-color),
			var(--default-node-shadow);
	}

	.nodeResetBtn:hover {
		color: var(
			--prop-drawer-reset-button-hover-text-color,
			var(
				--drawer-reset-button-hover-text-color,
				var(--default-drawer-reset-button-hover-text-color)
			)
		);
		background-color: var(
			--prop-drawer-reset-button-hover-color,
			var(--drawer-reset-button-hover-color, var(--default-drawer-reset-button-hover-color))
		);
	}
</style>

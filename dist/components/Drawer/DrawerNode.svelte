<script context="module">
	import { writable } from 'svelte/store';
	import { addProps } from '../../utils';
	import { getSnappedPosition } from '../../utils/snapGrid';
	export const defaultNodePropsStore = writable([]);
	let nodeProps = {
		width: 200,
		height: 100,
		x: 0,
		y: 0
	};
	let bgColor;
	let borderColor;
	let label;
	let width = 200;
	let height = 100;
	let locked;
	let center;
	let inputs;
	let outputs;
	let rotation;
	let zIndex;
	let TD;
	let LR;
	let useDefaults;
	let nodeDirection;
	let x = 0;
	let y = 0;
	export const createNodeProps = (edgeProps, anchorProps) => {
		const snappedPosition = getSnappedPosition(x, y);
		x = snappedPosition.x;
		y = snappedPosition.y;
		const nodeProps2 = { x, y };
		const nodePropNames = [
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
		const nodePropsArray = [
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
		addProps(nodePropNames, nodePropsArray, nodeProps2);
		console.log('Nodo antes de props insertado', nodeProps2);
		if (anchorProps) nodeProps2.anchors = anchorProps;
		if (edgeProps) nodeProps2.edgeProps = edgeProps;
		console.log('Nodo despues de props insertado', nodeProps2);
		defaultNodePropsStore.update((nodes) => {
			const updatedNodes = [...nodes, nodeProps2];
			console.log('updated store:', updatedNodes);
			return updatedNodes;
		});
		return nodeProps2;
	};
	const handleNodeResetButtonClick = (e) => {
		bgColor = void 0;
		borderColor = void 0;
		label = void 0;
		width = 200;
		height = 100;
		inputs = void 0;
		outputs = void 0;
		locked = void 0;
		center = void 0;
		rotation = void 0;
		zIndex = void 0;
		TD = void 0;
		LR = void 0;
		useDefaults = void 0;
		x = 0;
		y = 0;
		const formElement = e.currentTarget;
		formElement.reset();
	};
	const handleLockedButtonClick = (e) => {
		const target = e.target;
		locked = target.checked;
	};
	const handleCenterButtonClick = (e) => {
		const target = e.target;
		center = target.checked;
	};
	const handleUseDefaultsButtonClick = (e) => {
		const target = e.target;
		useDefaults = target.checked;
	};
	const handleAnchorPositionButton = (e) => {
		const target = e.target;
		if (target.value == '') nodeDirection = void 0;
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

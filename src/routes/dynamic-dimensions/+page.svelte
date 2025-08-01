<script>
	import { Svelvet, Node } from '$lib';
	import { onMount } from 'svelte';

	let graph;
	/** @type {Record<string, {width: number, height: number}>} */
	let nodeDimensions = {};

	function handleNodeDimensionsChanged(event) {
		const { nodeId, newDimensions } = event.detail;
		if (!nodeId || !newDimensions) return;
		nodeDimensions[nodeId] = newDimensions;
		console.log(`📏 Размеры ноды ${nodeId} изменились:`, newDimensions);
	}

	function getNodeDimensions(nodeId) {
		if (graph) {
			const dimensions = graph.getNodeDimensions(nodeId);
			console.log(`📐 Получены размеры ноды ${nodeId}:`, dimensions);
			alert(`Нода ${nodeId} имеет размеры: ${dimensions?.width}x${dimensions?.height}`);
			return dimensions;
		}
		return null;
	}

	// Контент нод обновляется динамически
	let node1Lines = ['Строка контента 1', 'Строка контента 2', 'Строка контента 3'];
	let node3Lines = [
		'Эта нода содержит много текста для демонстрации автоматического определения высоты.',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		'Ut enim ad minim veniam, quis nostrud exercitation.'
	];

	function addContentNode1() {
		node1Lines = [...node1Lines, `Новая строка ${node1Lines.length + 1}`];
	}

	function removeContentNode1() {
		if (node1Lines.length > 1) {
			node1Lines = node1Lines.slice(0, -1);
		}
	}
</script>

<div class="container">
	<h1>Тест динамических размеров нод</h1>

	<div class="info">
		<h2>Функциональность:</h2>
		<ul>
			<li>Ноды автоматически измеряют свою высоту после рендеринга</li>
			<li>При изменении контента размеры обновляются</li>
			<li>API метод <code>graph.getNodeDimensions(nodeId)</code> возвращает актуальные размеры</li>
			<li>Событие <code>nodeDimensionsChanged</code> срабатывает при изменении размеров</li>
		</ul>

		<h3>Инструкции:</h3>
		<ol>
			<li>Нажмите "Добавить контент" чтобы увеличить высоту ноды</li>
			<li>Нажмите "Удалить контент" чтобы уменьшить высоту</li>
			<li>Нажмите "Получить размеры" чтобы получить актуальные размеры через API</li>
			<li>Смотрите консоль для логов событий</li>
		</ol>
	</div>

	<div class="canvas-container">
		<Svelvet bind:graph>
			<Node
				id="node1"
				position={{ x: 100, y: 100 }}
				on:nodeDimensionsChanged={handleNodeDimensionsChanged}
			>
				<div class="custom-node-content">
					<h3>Нода 1</h3>
					{#each node1Lines as line}
						<p>{line}</p>
					{/each}
					<div class="buttons">
						<button on:click={addContentNode1}>Добавить контент</button>
						<button on:click={removeContentNode1}>Удалить контент</button>
						<button on:click={() => getNodeDimensions('node1')}>Получить размеры</button>
					</div>
					<div class="dimensions-display">
						Размеры: {nodeDimensions['node1']
							? `${Math.round(nodeDimensions['node1'].width)}x${Math.round(
									nodeDimensions['node1'].height
							  )}px`
							: 'обновляются...'}
					</div>
				</div>
			</Node>

			<Node
				id="node2"
				position={{ x: 450, y: 100 }}
				on:nodeDimensionsChanged={handleNodeDimensionsChanged}
			>
				<div class="custom-node-content">
					<h3>Нода 2</h3>
					<p>Короткий контент</p>
					<div class="buttons">
						<button on:click={() => getNodeDimensions('node2')}>Получить размеры</button>
					</div>
					<div class="dimensions-display">
						Размеры: {nodeDimensions['node2']
							? `${Math.round(nodeDimensions['node2'].width)}x${Math.round(
									nodeDimensions['node2'].height
							  )}px`
							: 'обновляются...'}
					</div>
				</div>
			</Node>

			<Node
				id="node3"
				position={{ x: 250, y: 300 }}
				on:nodeDimensionsChanged={handleNodeDimensionsChanged}
			>
				<div class="custom-node-content">
					<h3>Нода 3 с длинным контентом</h3>
					{#each node3Lines as line}
						<p>{line}</p>
					{/each}
					<div class="buttons">
						<button on:click={() => getNodeDimensions('node3')}>Получить размеры</button>
					</div>
					<div class="dimensions-display">
						Размеры: {nodeDimensions['node3']
							? `${Math.round(nodeDimensions['node3'].width)}x${Math.round(
									nodeDimensions['node3'].height
							  )}px`
							: 'обновляются...'}
					</div>
				</div>
			</Node>
		</Svelvet>
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		font-family: Arial, sans-serif;
	}

	h1 {
		margin: 20px;
		color: #333;
	}

	.info {
		margin: 0 20px 20px 20px;
		padding: 20px;
		background: #f5f5f5;
		border-radius: 8px;
		max-width: 800px;
	}

	.info h2 {
		margin-top: 0;
		color: #555;
	}

	.info h3 {
		margin-top: 20px;
		color: #666;
	}

	.info ul,
	.info ol {
		margin: 10px 0;
		padding-left: 30px;
	}

	.info li {
		margin: 5px 0;
	}

	.info code {
		background: #e0e0e0;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
	}

	.canvas-container {
		flex: 1;
		margin: 0 20px 20px 20px;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		position: relative;
	}

	.custom-node-content {
		padding: 20px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		min-width: 250px;
	}

	.custom-node-content h3 {
		margin: 0 0 15px 0;
		color: #333;
	}

	.custom-node-content p {
		margin: 8px 0;
		color: #666;
	}

	.buttons {
		margin-top: 15px;
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.buttons button {
		padding: 6px 12px;
		background: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
	}

	.buttons button:hover {
		background: #45a049;
	}

	.dimensions-display {
		margin-top: 10px;
		font-size: 12px;
		color: #888;
		font-family: monospace;
	}
</style>

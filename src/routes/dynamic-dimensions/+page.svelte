<script>
	import { Svelvet, Node } from '$lib';
	import { getContext } from 'svelte';

	let svelvetInstance;
	/** @type {Record<string, {width: number, height: number}>} */
	let nodeDimensions = {};

	// Компонент с динамическим контентом
	function DynamicContentNode({ id }) {
		const graph = getContext('graph');
		let contentLines = 3;

		function addContent() {
			contentLines += 1;
		}

		function removeContent() {
			if (contentLines > 1) {
				contentLines -= 1;
			}
		}

		function cloneNode() {
			// Получаем актуальные размеры через API
			const dimensions = graph.getNodeDimensions(id);
			console.log(`Клонирование ноды ${id} с размерами:`, dimensions);

			// Здесь можно добавить логику клонирования
			alert(`Нода ${id} имеет размеры: ${dimensions?.width}x${dimensions?.height}`);
		}

		return {
			c() {
				const container = document.createElement('div');
				container.style.padding = '20px';
				container.style.minWidth = '300px';
				container.innerHTML = `
                    <h3>Нода ${id}</h3>
                    <div id="content-${id}">
                        ${Array(contentLines)
													.fill(0)
													.map((_, i) => `<p>Строка контента ${i + 1}</p>`)
													.join('')}
                    </div>
                    <div style="margin-top: 10px;">
                        <button id="add-${id}">Добавить контент</button>
                        <button id="remove-${id}">Удалить контент</button>
                        <button id="clone-${id}">Клонировать</button>
                    </div>
                    <div id="dimensions-${id}" style="margin-top: 10px; font-size: 12px; color: #666;">
                        Размеры: обновляются...
                    </div>
                `;

				return container;
			},
			m(target, anchor) {
				target.insertBefore(this.container, anchor);

				// Обработчики событий
				document.getElementById(`add-${id}`).addEventListener('click', () => {
					addContent();
					this.updateContent();
				});

				document.getElementById(`remove-${id}`).addEventListener('click', () => {
					removeContent();
					this.updateContent();
				});

				document.getElementById(`clone-${id}`).addEventListener('click', cloneNode);
			},
			updateContent() {
				const contentDiv = document.getElementById(`content-${id}`);
				if (contentDiv) {
					contentDiv.innerHTML = Array(contentLines)
						.fill(0)
						.map((_, i) => `<p>Строка контента ${i + 1}</p>`)
						.join('');
				}
			},
			updateDimensions(width, height) {
				const dimensionsDiv = document.getElementById(`dimensions-${id}`);
				if (dimensionsDiv) {
					dimensionsDiv.textContent = `Размеры: ${Math.round(width)}x${Math.round(height)}px`;
				}
			},
			container: null
		};
	}

	function handleNodeDimensionsChanged(event) {
		const { nodeId, newDimensions } = event.detail;
		if (!nodeId || !newDimensions) return;
		nodeDimensions[nodeId] = newDimensions;
		console.log(`📏 Размеры ноды ${nodeId} изменились:`, newDimensions);

		// Обновляем отображение размеров в ноде
		const nodeComponent = document.querySelector(`[id="${nodeId}"] .custom-node-content`);
		if (nodeComponent && nodeComponent._component) {
			nodeComponent._component.updateDimensions(newDimensions.width, newDimensions.height);
		}
	}

	function getNodeDimensions(nodeId) {
		if (svelvetInstance?.graph) {
			const dimensions = svelvetInstance.graph.getNodeDimensions(nodeId);
			console.log(`📐 Получены размеры ноды ${nodeId}:`, dimensions);
			return dimensions;
		}
		return null;
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
			<li>Нажмите "Клонировать" чтобы получить актуальные размеры через API</li>
			<li>Смотрите консоль для логов событий</li>
		</ol>
	</div>

	<div class="canvas-container">
		<Svelvet bind:this={svelvetInstance}>
			<Node
				id="node1"
				position={{ x: 100, y: 100 }}
				on:nodeDimensionsChanged={handleNodeDimensionsChanged}
			>
				<div class="custom-node-content">
					<h3>Нода 1</h3>
					{#each Array(3) as _, i}
						<p>Строка контента {i + 1}</p>
					{/each}
					<div class="buttons">
						<button
							on:click={() => {
								const content = document.querySelector('[id="node1"] .custom-node-content');
								const p = document.createElement('p');
								p.textContent = `Новая строка ${content.children.length}`;
								content.insertBefore(p, content.querySelector('.buttons'));
							}}>Добавить контент</button
						>
						<button
							on:click={() => {
								const content = document.querySelector('[id="node1"] .custom-node-content');
								const paragraphs = content.querySelectorAll('p');
								if (paragraphs.length > 1) {
									paragraphs[paragraphs.length - 1].remove();
								}
							}}>Удалить контент</button
						>
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
					<p>Эта нода содержит много текста для демонстрации автоматического определения высоты.</p>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
					<p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
					<p>Ut enim ad minim veniam, quis nostrud exercitation.</p>
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

<script>
	import { Svelvet, Node } from '$lib';
</script>

<div class="container">
	<h1>Демо управления Svelvet</h1>

	<div class="info">
		<h2>Новые возможности управления:</h2>

		<h3>🖱️ Мышь/Тачпад:</h3>
		<ul>
			<li><strong>Пробел + перетаскивание</strong> - перемещение холста (как в Figma)</li>
			<li><strong>Колесо мыши</strong> - скролл вверх/вниз (если включен trackpadPan)</li>
			<li><strong>Ctrl + колесо мыши</strong> - масштабирование</li>
			<li><strong>Обычное перетаскивание</strong> - перемещение холста (если pannable=true)</li>
		</ul>

		<h3>⌨️ Клавиатура:</h3>
		<ul>
			<li><strong>Пробел</strong> - режим перемещения (курсор меняется на "grab")</li>
			<li><strong>+/-</strong> - масштабирование</li>
			<li><strong>Стрелки</strong> - навигация между нодами</li>
			<li><strong>Delete/Backspace</strong> - удаление выделенных соединений</li>
		</ul>
	</div>

	<div class="demos">
		<div class="demo-section">
			<h3>Вариант 1: Скролл = движение (рекомендуется)</h3>
			<div class="canvas-container">
				<Svelvet trackpadPan={true} modifier="ctrl" minimap controls>
					<Node id="1" position={{ x: 100, y: 100 }}>
						<div class="node-content">
							<h4>Нода 1</h4>
							<p>trackpadPan = true</p>
							<p>Скролл двигает холст</p>
						</div>
					</Node>
					<Node id="2" position={{ x: 400, y: 100 }}>
						<div class="node-content">
							<h4>Нода 2</h4>
							<p>Ctrl + скролл = зум</p>
						</div>
					</Node>
					<Node id="3" position={{ x: 250, y: 250 }}>
						<div class="node-content">
							<h4>Нода 3</h4>
							<p>Пробел + мышь = pan</p>
						</div>
					</Node>
				</Svelvet>
			</div>
		</div>

		<div class="demo-section">
			<h3>Вариант 2: Скролл = зум (по умолчанию)</h3>
			<div class="canvas-container">
				<Svelvet trackpadPan={false} minimap controls>
					<Node id="4" position={{ x: 100, y: 100 }}>
						<div class="node-content">
							<h4>Нода 4</h4>
							<p>trackpadPan = false</p>
							<p>Скролл масштабирует</p>
						</div>
					</Node>
					<Node id="5" position={{ x: 400, y: 100 }}>
						<div class="node-content">
							<h4>Нода 5</h4>
							<p>Пробел + мышь = pan</p>
						</div>
					</Node>
				</Svelvet>
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		font-family: Arial, sans-serif;
		padding: 20px;
		box-sizing: border-box;
	}

	h1 {
		margin-bottom: 20px;
		color: #333;
	}

	.info {
		background: #f5f5f5;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 20px;
		max-width: 800px;
	}

	.info h2 {
		margin-top: 0;
		color: #555;
	}

	.info h3 {
		margin-top: 15px;
		color: #666;
	}

	.info ul {
		margin: 10px 0;
		padding-left: 30px;
	}

	.info li {
		margin: 5px 0;
		line-height: 1.5;
	}

	.info strong {
		color: #333;
		background: #e0e0e0;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.9em;
	}

	.demos {
		display: flex;
		gap: 20px;
		flex: 1;
		min-height: 0;
	}

	.demo-section {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.demo-section h3 {
		margin-bottom: 10px;
		color: #444;
	}

	.canvas-container {
		flex: 1;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		position: relative;
		background: #fafafa;
	}

	.node-content {
		padding: 20px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		min-width: 200px;
	}

	.node-content h4 {
		margin: 0 0 10px 0;
		color: #333;
	}

	.node-content p {
		margin: 5px 0;
		color: #666;
		font-size: 14px;
	}

	@media (max-width: 900px) {
		.demos {
			flex-direction: column;
		}
	}
</style>

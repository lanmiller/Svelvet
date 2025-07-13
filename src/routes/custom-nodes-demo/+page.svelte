<script lang="ts">
	import { Svelvet, Node, Anchor, Controls, Minimap, Background } from '$lib';
	import ThemeToggle from '$lib/components/ThemeToggle/ThemeToggle.svelte';
	import { onMount, getContext } from 'svelte';
	import type { EdgeStyle } from '$lib/types'; // Добавляем импорт типа

	// Состояние для контроля соединений
	let showConnections = false;
	let edgeAlgorithm: EdgeStyle = 'orthogonal'; // ✅ Исправлено: добавлен тип

	// Состояние для управления соединениями
	let selectedEdge: string | null = null; // ✅ Исправлено: добавлен тип
	let connectionStats = { total: 0, selected: null };

	// Функции управления
	function toggleConnections() {
		showConnections = !showConnections;
		selectedEdge = null;
		updateConnectionStats();
	}

	function setEdgeAlgorithm(algorithm: EdgeStyle) {
		// ✅ Исправлено: добавлен тип
		edgeAlgorithm = algorithm;
	}

	// Обновление статистики соединений
	function updateConnectionStats() {
		// Подсчитываем активные соединения из конфигурации
		let total = 0;
		if (showConnections) {
			total = Object.values(connectionConfig).reduce((sum, connections) => {
				return sum + (Array.isArray(connections) ? connections.length : 0);
			}, 0);
		}

		connectionStats = {
			total,
			selected: selectedEdge
		};
	}

	// Получаем доступ к selectedEdgeStore из Svelvet

	// selectedEdgeStore управляется автоматически через Svelvet

	// Конфигурация множественных соединений
	$: connectionConfig = showConnections
		? {
				// Главная нода → множественные цели
				'main-node-output': ['target-1', 'target-2', 'target-3'],
				// Множественные источники → одна цель
				'source-1-output': ['collector-node'],
				'source-2-output': ['collector-node'],
				'source-3-output': ['collector-node'],
				// Цепочки
				'target-1-output': ['final-node'],
				'target-2-output': ['final-node']
		  }
		: {};

	onMount(() => {
		// selectedEdgeStore должен передаваться автоматически через контекст Svelvet
		console.log('🔧 Демо страница инициализирована');
	});

	// Сброс выделения соединений происходит автоматически через Svelvet

	// Обработчики событий соединений
	function handleConnection(event: CustomEvent) {
		// ✅ Исправлено: добавлен тип
		console.log('🔗 Создано соединение:', event.detail);
	}

	function handleDisconnection(event: CustomEvent) {
		// ✅ Исправлено: добавлен тип
		console.log('❌ Удалено соединение:', event.detail);
		// Если удаленное соединение было выбрано, сбрасываем выбор
		if (selectedEdge && event.detail.edgeId === selectedEdge) {
			selectedEdge = null;
			updateConnectionStats();
		}
	}
</script>

<body>
	<div class="demo-header">
		<h1>🎯 Демо интерактивных соединений</h1>
		<p>Клик по соединению → выделение, Delete → удаление</p>

		<!-- Контролы -->
		<div class="demo-controls">
			<button class="control-btn" class:active={showConnections} on:click={toggleConnections}>
				{showConnections ? '🔗 Скрыть соединения' : '🔗 Показать соединения'}
			</button>

			{#if selectedEdge}
				<div class="selected-info">
					Выбрано: {selectedEdge}
				</div>
			{/if}

			<div class="algorithm-controls">
				<span>Алгоритм:</span>
				<button
					class="algo-btn"
					class:active={edgeAlgorithm === 'orthogonal'}
					on:click={() => setEdgeAlgorithm('orthogonal')}
				>
					Ортогональный
				</button>
				<button
					class="algo-btn"
					class:active={edgeAlgorithm === 'smart-step'}
					on:click={() => setEdgeAlgorithm('smart-step')}
				>
					Умный
				</button>
				<button
					class="algo-btn"
					class:active={edgeAlgorithm === 'minimal-step'}
					on:click={() => setEdgeAlgorithm('minimal-step')}
				>
					Минимальный
				</button>
				<button
					class="algo-btn"
					class:active={edgeAlgorithm === 'direct-step'}
					on:click={() => setEdgeAlgorithm('direct-step')}
				>
					Прямой
				</button>
			</div>
		</div>
	</div>

	<Svelvet
		minimap
		controls
		edgeStyle={edgeAlgorithm}
		theme="light"
		width={1600}
		height={1000}
		zoom={0.7}
		translation={{ x: 50, y: 50 }}
		on:connection={handleConnection}
		on:disconnection={handleDisconnection}
	>
		<Background slot="background" />

		<!-- ГЛАВНАЯ НОДА: Один выход → множественные входы -->
		<Node id="main-node" dimensions={{ width: 300, height: 150 }} position={{ x: 100, y: 400 }}>
			<div class="main-node">
				<div class="node-header">
					<h4>🎯 Главная нода</h4>
					<div class="node-subtitle">1 выход → 3 входа</div>
				</div>
				<div class="node-content">
					<div class="feature">✨ Один источник данных</div>
					<div class="feature">📊 Распределение по целям</div>
				</div>

				<!-- Входящий анчор слева -->
				<div class="anchor-left">
					<Anchor input direction="west" bgColor="#10b981" />
				</div>

				<!-- Исходящий анчор справа с множественными соединениями -->
				<div class="anchor-right">
					<Anchor
						id="main-node-output"
						output
						direction="east"
						bgColor="#f59e0b"
						connections={connectionConfig['main-node-output'] || []}
					/>
				</div>
			</div>
		</Node>

		<!-- ЦЕЛЕВЫЕ НОДЫ: Принимают от главной ноды -->
		<Node id="target-1" dimensions={{ width: 250, height: 120 }} position={{ x: 600, y: 200 }}>
			<div class="target-node">
				<div class="node-header">
					<h4>🎯 Цель 1</h4>
				</div>
				<div class="node-content">
					<div class="status">📈 Обработка данных</div>
				</div>

				<div class="anchor-left">
					<Anchor input direction="west" bgColor="#10b981" />
				</div>
				<div class="anchor-right">
					<Anchor
						id="target-1-output"
						output
						direction="east"
						bgColor="#f59e0b"
						connections={connectionConfig['target-1-output'] || []}
					/>
				</div>
			</div>
		</Node>

		<Node id="target-2" dimensions={{ width: 250, height: 120 }} position={{ x: 600, y: 400 }}>
			<div class="target-node">
				<div class="node-header">
					<h4>🎯 Цель 2</h4>
				</div>
				<div class="node-content">
					<div class="status">⚙️ Трансформация</div>
				</div>

				<div class="anchor-left">
					<Anchor input direction="west" bgColor="#10b981" />
				</div>
				<div class="anchor-right">
					<Anchor
						id="target-2-output"
						output
						direction="east"
						bgColor="#f59e0b"
						connections={connectionConfig['target-2-output'] || []}
					/>
				</div>
			</div>
		</Node>

		<Node id="target-3" dimensions={{ width: 250, height: 120 }} position={{ x: 600, y: 600 }}>
			<div class="target-node">
				<div class="node-header">
					<h4>🎯 Цель 3</h4>
				</div>
				<div class="node-content">
					<div class="status">💾 Сохранение</div>
				</div>

				<div class="anchor-left">
					<Anchor input direction="west" bgColor="#10b981" />
				</div>
				<div class="anchor-right">
					<Anchor output direction="east" bgColor="#f59e0b" />
				</div>
			</div>
		</Node>

		<!-- ИСТОЧНИКИ: Множественные выходы → один вход -->
		<Node id="source-1" dimensions={{ width: 200, height: 100 }} position={{ x: 100, y: 50 }}>
			<div class="source-node">
				<div class="node-header">
					<h4>📤 Источник 1</h4>
				</div>

				<div class="anchor-right">
					<Anchor
						id="source-1-output"
						output
						direction="east"
						bgColor="#f59e0b"
						connections={connectionConfig['source-1-output'] || []}
					/>
				</div>
			</div>
		</Node>

		<Node id="source-2" dimensions={{ width: 200, height: 100 }} position={{ x: 100, y: 170 }}>
			<div class="source-node">
				<div class="node-header">
					<h4>📤 Источник 2</h4>
				</div>

				<div class="anchor-right">
					<Anchor
						id="source-2-output"
						output
						direction="east"
						bgColor="#f59e0b"
						connections={connectionConfig['source-2-output'] || []}
					/>
				</div>
			</div>
		</Node>

		<Node id="source-3" dimensions={{ width: 200, height: 100 }} position={{ x: 100, y: 290 }}>
			<div class="source-node">
				<div class="node-header">
					<h4>📤 Источник 3</h4>
				</div>

				<div class="anchor-right">
					<Anchor
						id="source-3-output"
						output
						direction="east"
						bgColor="#f59e0b"
						connections={connectionConfig['source-3-output'] || []}
					/>
				</div>
			</div>
		</Node>

		<!-- КОЛЛЕКТОР: Множественные входы → один выход -->
		<Node
			id="collector-node"
			dimensions={{ width: 300, height: 150 }}
			position={{ x: 450, y: 100 }}
		>
			<div class="collector-node">
				<div class="node-header">
					<h4>🔄 Коллектор</h4>
					<div class="node-subtitle">3 входа → 1 выход</div>
				</div>
				<div class="node-content">
					<div class="feature">📥 Сбор данных</div>
					<div class="feature">🔀 Объединение</div>
				</div>

				<!-- Один входящий анчор принимает множественные соединения -->
				<div class="anchor-left">
					<Anchor input direction="west" bgColor="#10b981" />
				</div>

				<div class="anchor-right">
					<Anchor output direction="east" bgColor="#f59e0b" />
				</div>
			</div>
		</Node>

		<!-- ФИНАЛЬНАЯ НОДА: Множественные входы -->
		<Node id="final-node" dimensions={{ width: 300, height: 150 }} position={{ x: 1100, y: 300 }}>
			<div class="final-node">
				<div class="node-header">
					<h4>🏁 Финальная обработка</h4>
					<div class="node-subtitle">Множественные входы</div>
				</div>
				<div class="node-content">
					<div class="feature">🎯 Конечный результат</div>
					<div class="feature">📊 Агрегация данных</div>
				</div>

				<!-- Один входящий анчор принимает множественные соединения -->
				<div class="anchor-left">
					<Anchor input direction="west" bgColor="#10b981" />
				</div>
			</div>
		</Node>

		<Controls slot="controls" />
		<Minimap slot="minimap" />
	</Svelvet>

	<div class="demo-info">
		<h3>🔧 Интерактивные соединения:</h3>
		<ul>
			<li class:checked={showConnections}>✅ Клик по соединению → выделение</li>
			<li class:checked={selectedEdge}>✅ Delete/Backspace → удаление</li>
			<li>✅ Escape → снятие выделения</li>
			<li>✅ Множественные соединения к одному анчору</li>
			<li>✅ Ортогональные соединения (90°)</li>
			<li>✅ Визуальная обратная связь</li>
		</ul>

		<div class="current-algorithm">
			<strong>Алгоритм:</strong>
			{edgeAlgorithm}
		</div>

		<div class="connection-stats">
			<strong>Соединений:</strong>
			{connectionStats.total}
			{#if connectionStats.selected}
				<br /><span class="selected-edge">Выбрано: {connectionStats.selected}</span>
			{/if}
		</div>

		<div class="help-text">
			<strong>Управление:</strong>
			<br />• Клик по соединению - выделить
			<br />• Delete - удалить выбранное
			<br />• Escape - снять выделение
		</div>
	</div>

	<!-- ✅ Исправлено: убрали slot для ThemeToggle -->
	<ThemeToggle main="dark" alt="light" />
</body>

<style>
	body {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background: #f8fafc;
	}

	.demo-header {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 1000;
		background: white;
		padding: 16px 24px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		max-width: 400px;
	}

	.demo-header h1 {
		margin: 0 0 8px 0;
		font-size: 24px;
		color: #1e293b;
	}

	.demo-header p {
		margin: 0 0 16px 0;
		color: #64748b;
		font-size: 14px;
	}

	.demo-controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.control-btn,
	.delete-btn {
		padding: 8px 16px;
		background: #f1f5f9;
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.control-btn:hover,
	.delete-btn:hover {
		background: #e2e8f0;
	}

	.control-btn.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.delete-btn {
		background: #fef2f2;
		border-color: #fecaca;
		color: #dc2626;
	}

	.delete-btn:hover {
		background: #fee2e2;
		border-color: #fca5a5;
	}

	.algorithm-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		font-size: 13px;
	}

	.algorithm-controls span {
		color: #64748b;
		font-weight: 500;
	}

	.algo-btn {
		padding: 4px 8px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
		transition: all 0.2s;
	}

	.algo-btn:hover {
		background: #f1f5f9;
	}

	.algo-btn.active {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}

	.demo-info {
		position: absolute;
		bottom: 20px;
		right: 20px;
		z-index: 1000;
		background: white;
		padding: 16px 20px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		max-width: 300px;
	}

	.demo-info h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		color: #1e293b;
	}

	.demo-info ul {
		margin: 0 0 12px 0;
		padding-left: 16px;
		font-size: 13px;
		color: #475569;
		line-height: 1.6;
	}

	.demo-info li.checked {
		color: #10b981;
		font-weight: 500;
	}

	.current-algorithm,
	.connection-stats,
	.help-text {
		padding: 8px 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 12px;
		color: #475569;
		margin-bottom: 8px;
	}

	.connection-stats:last-child,
	.help-text:last-child {
		margin-bottom: 0;
	}

	.selected-edge {
		color: #ef4444;
		font-weight: 600;
	}

	.help-text {
		background: #fffbeb;
		border-color: #fed7aa;
		color: #92400e;
	}

	/* Стили для разных типов нод */
	.main-node,
	.target-node,
	.source-node,
	.collector-node,
	.final-node {
		width: 100%;
		height: 100%;
		border-radius: 12px;
		padding: 16px;
		position: relative;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		border: 2px solid;
	}

	.main-node {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: #5a67d8;
		color: white;
	}

	.target-node {
		background: white;
		border-color: #3b82f6;
	}

	.source-node {
		background: white;
		border-color: #10b981;
	}

	.collector-node {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		border-color: #e53e3e;
		color: white;
	}

	.final-node {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		border-color: #0ea5e9;
		color: white;
	}

	.node-header {
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.target-node .node-header,
	.source-node .node-header {
		border-bottom-color: #e2e8f0;
	}

	.node-header h4 {
		margin: 0 0 4px 0;
		font-size: 16px;
	}

	.node-subtitle {
		font-size: 11px;
		opacity: 0.8;
		font-weight: 500;
	}

	.node-content {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.feature,
	.status {
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		font-size: 13px;
		backdrop-filter: blur(10px);
	}

	.target-node .status,
	.source-node .status {
		background: #f8fafc;
		color: #475569;
	}

	/* Позиционирование анчоров */
	.anchor-left {
		position: absolute;
		left: -8px;
		top: 50%;
		transform: translateY(-50%);
	}

	.anchor-right {
		position: absolute;
		right: -8px;
		top: 50%;
		transform: translateY(-50%);
	}

	/* Скрываем стандартные стили Svelvet нод */
	:global(.svelvet-node) {
		box-shadow: none !important;
		background: transparent !important;
		border: none !important;
	}

	/* Стили для выделенных соединений */
	:global(.svelvet-edge.selected) {
		stroke: #ef4444 !important;
		stroke-width: 3px !important;
	}

	/* Темная тема */
	:global(html.dark) body {
		background: #0f172a;
	}

	:global(html.dark) .demo-header,
	:global(html.dark) .demo-info {
		background: #1e293b;
		border-color: #334155;
		color: #f1f5f9;
	}

	:global(html.dark) .demo-header h1,
	:global(html.dark) .demo-info h3 {
		color: #f1f5f9;
	}

	:global(html.dark) .demo-header p,
	:global(html.dark) .demo-info ul {
		color: #94a3b8;
	}

	:global(html.dark) .control-btn,
	:global(html.dark) .delete-btn {
		background: #334155;
		border-color: #475569;
		color: #f1f5f9;
	}

	:global(html.dark) .control-btn:hover,
	:global(html.dark) .delete-btn:hover {
		background: #475569;
	}

	:global(html.dark) .delete-btn {
		background: #450a0a;
		border-color: #7f1d1d;
		color: #fca5a5;
	}

	:global(html.dark) .delete-btn:hover {
		background: #7f1d1d;
		border-color: #991b1b;
	}

	:global(html.dark) .algo-btn {
		background: #334155;
		border-color: #475569;
		color: #f1f5f9;
	}

	:global(html.dark) .algo-btn:hover {
		background: #475569;
	}

	:global(html.dark) .current-algorithm,
	:global(html.dark) .connection-stats {
		background: #334155;
		border-color: #475569;
		color: #cbd5e1;
	}

	:global(html.dark) .help-text {
		background: #451a03;
		border-color: #78350f;
		color: #fbbf24;
	}

	:global(html.dark) .target-node,
	:global(html.dark) .source-node {
		background: #1e293b;
		border-color: #334155;
	}

	:global(html.dark) .target-node .node-header,
	:global(html.dark) .source-node .node-header {
		border-bottom-color: #334155;
	}

	:global(html.dark) .target-node .node-header h4,
	:global(html.dark) .source-node .node-header h4 {
		color: #f1f5f9;
	}

	:global(html.dark) .target-node .status,
	:global(html.dark) .source-node .status {
		background: #334155;
		color: #cbd5e1;
	}
</style>

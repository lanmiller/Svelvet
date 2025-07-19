# Динамические размеры нод в Svelvet форке

## Обзор

Эта функциональность решает проблему получения актуальных размеров нод после рендеринга, что критически важно для:

- Правильного клонирования нод с учетом их реальной высоты
- Авто-расстановки нод без наслоения
- Динамического позиционирования элементов

## Реализованные возможности

### 1. Автоматическое измерение размеров

Ноды автоматически отслеживают изменения своих размеров после рендеринга. Это работает для всех нод с динамическим контентом (когда не заданы фиксированные `width` и `height`).

### 2. API метод `getNodeDimensions`

```javascript
// Получить размеры ноды через graph instance
const graph = getContext('graph');
const dimensions = graph.getNodeDimensions('node-id');

// Возвращает объект с размерами или null если нода не найдена
// { width: number, height: number }
```

### 3. Событие `nodeDimensionsChanged`

```svelte
<script>
	function handleDimensionsChange(event) {
		const {
			nodeId, // ID ноды (без префикса 'N-')
			node, // Объект ноды
			oldDimensions, // { width, height } - предыдущие размеры
			newDimensions // { width, height } - новые размеры
		} = event.detail;

		console.log(
			`Нода ${nodeId} изменила размеры с ${oldDimensions.width}x${oldDimensions.height} на ${newDimensions.width}x${newDimensions.height}`
		);
	}
</script>

<Node id="my-node" on:nodeDimensionsChanged={handleDimensionsChange}>
	<!-- Контент ноды -->
</Node>
```

## Пример использования для клонирования нод

```javascript
export function cloneNode(nodeId) {
	// Получаем актуальные размеры исходной ноды
	const dimensions = graph.getNodeDimensions(nodeId);

	if (!dimensions) {
		console.error(`Нода ${nodeId} не найдена`);
		return;
	}

	const sourceNode = getNodeById(nodeId);
	const nodeHeight = dimensions.height; // Реальная высота, а не статическая
	const verticalSpacing = 50;

	// Позиционируем клон под оригиналом с учетом реальной высоты
	const newPosition = {
		x: sourceNode.position.x,
		y: sourceNode.position.y + nodeHeight + verticalSpacing
	};

	// Создаем клон с правильным позиционированием
	const clonedNode = {
		...sourceNode,
		id: generateNewId(),
		position: newPosition
	};

	addNode(clonedNode);
}
```

## Интеграция с UniversalNode

Компонент `UniversalNode` из основного проекта автоматически получает поддержку динамических размеров:

```svelte
<!-- В RefactoredSvelvetCanvas.svelte -->
<Node
    id={element.id}
    on:nodeDimensionsChanged={(e) => {
        // Обновляем размеры в workflow
        updateNodeDimensions(element.id, e.detail.newDimensions);
    }}
>
    <UniversalNode
        nodeId={element.id}
        nodeData={element.data}
        <!-- другие пропсы -->
    />
</Node>
```

## Технические детали

### Как это работает

1. При рендеринге ноды без фиксированных размеров, `InternalNode.svelte` использует `bind:clientHeight` и `bind:clientWidth` для отслеживания размеров DOM элемента

2. Реактивный блок следит за изменениями размеров и отправляет событие `nodeDimensionsChanged`

3. Размеры хранятся в Svelte stores внутри объекта ноды:

   ```javascript
   node.dimensions = {
   	width: writable(initialWidth),
   	height: writable(initialHeight)
   };
   ```

4. Метод `getNodeDimensions` извлекает текущие значения из stores

### Важные моменты

- Событие НЕ срабатывает при первоначальном рендеринге (когда размеры 0x0)
- Размеры обновляются автоматически при изменении контента ноды
- Для нод с фиксированными размерами (`dimensions`, `width` или `height` props) автоматическое измерение отключено

## Демо

Полный пример использования доступен по адресу: `/src/routes/dynamic-dimensions/`

Демо показывает:

- Ноды с динамическим контентом
- Добавление/удаление контента с автоматическим обновлением размеров
- Использование API для получения текущих размеров
- Отслеживание событий изменения размеров

## Миграция существующего кода

Для использования новой функциональности в существующем коде:

1. Замените статические значения высоты:

   ```javascript
   // Было
   const nodeHeight = sourceNode.dimensions?.height || 200;

   // Стало
   const dimensions = graph.getNodeDimensions(nodeId);
   const nodeHeight = dimensions?.height || 200;
   ```

2. Добавьте обработчик события для обновления workflow:

   ```svelte
   <Node {...nodeProps} on:nodeDimensionsChanged={updateWorkflowDimensions} />
   ```

3. Убедитесь, что ноды не имеют фиксированных размеров, если нужно динамическое измерение

## Ограничения

- Работает только для нод без фиксированных размеров
- Первое событие срабатывает только после изменения размеров (не при mount)
- Требует доступ к graph instance через context

# Руководство по интеграции динамических размеров нод

## Для основного проекта `/home/isin/evolve/front`

### Изменения в форке Svelvet

В форк добавлена поддержка динамических размеров нод:

1. **API метод**: `graph.getNodeDimensions(nodeId)` - возвращает `{ width, height }`
2. **Событие**: `nodeDimensionsChanged` - срабатывает при изменении размеров
3. **Автоматическое измерение**: ноды без фиксированных размеров автоматически отслеживают свою высоту

### Как использовать в RefactoredSvelvetCanvas

#### 1. Обновите функцию клонирования нод:

```javascript
// В cloneNode функции
export function cloneNode(nodeId) {
	// Получаем graph instance
	const svelvetInstance = document.querySelector('.svelvet-container')?.__svelte__;
	if (!svelvetInstance?.graph) {
		console.error('Graph instance не найден');
		return;
	}

	// Получаем актуальные размеры
	const dimensions = svelvetInstance.graph.getNodeDimensions(nodeId);
	const nodeHeight = dimensions?.height || 200;

	// Остальной код клонирования...
}
```

#### 2. Добавьте обработчик события размеров:

```svelte
<Node
	id={element.id}
	position={element.position}
	on:nodeDimensionsChanged={(e) => {
		// Обновляем размеры в элементе workflow
		const updatedElement = {
			...element,
			dimensions: e.detail.newDimensions
		};
		updateWorkflowElement(updatedElement);
	}}
>
	<UniversalNode {...props} />
</Node>
```

#### 3. Сохраняйте размеры в workflow:

```javascript
// При сохранении workflow
function saveWorkflowToLocalStorage() {
	const workflowData = {
		...currentWorkflow,
		elements: currentWorkflow.elements.map((element) => {
			// Получаем актуальные размеры перед сохранением
			const dimensions = graph.getNodeDimensions(element.id);
			return {
				...element,
				dimensions: dimensions || element.dimensions
			};
		})
	};

	localStorage.setItem('workflow', JSON.stringify(workflowData));
}
```

### Пример полной интеграции

```svelte
<script>
	import { Svelvet, Node, Edge, Anchor } from '$lib/svelvet';
	import UniversalNode from './nodes/UniversalNode.svelte';

	let svelvetInstance;

	function handleNodeDimensionsChanged(event) {
		const { nodeId, newDimensions } = event.detail;
		console.log(
			`Нода ${nodeId} изменила размеры на ${newDimensions.width}x${newDimensions.height}`
		);

		// Обновляем данные в workflow
		currentWorkflow.elements = currentWorkflow.elements.map((el) =>
			el.id === nodeId ? { ...el, dimensions: newDimensions } : el
		);
	}

	function cloneNodeWithProperSpacing(nodeId) {
		if (!svelvetInstance?.graph) return;

		const sourceNode = currentWorkflow.elements.find((el) => el.id === nodeId);
		if (!sourceNode) return;

		// Получаем реальную высоту ноды
		const dimensions = svelvetInstance.graph.getNodeDimensions(nodeId);
		const nodeHeight = dimensions?.height || 200;

		// Создаем клон с правильным позиционированием
		const clonedNode = {
			...sourceNode,
			id: generateNewId(),
			position: {
				x: sourceNode.position.x,
				y: sourceNode.position.y + nodeHeight + 50 // 50px отступ
			},
			data: {
				...sourceNode.data,
				isCloned: true,
				items: [] // Очищаем контент для клона
			}
		};

		// Добавляем клон в workflow
		currentWorkflow.elements.push(clonedNode);
		currentWorkflow = currentWorkflow; // Триггерим реактивность
	}
</script>

<Svelvet bind:this={svelvetInstance}>
	{#each currentWorkflow.elements as element}
		<Node
			id={element.id}
			position={element.position}
			on:nodeDimensionsChanged={handleNodeDimensionsChanged}
		>
			<UniversalNode
				nodeId={element.id}
				nodeData={element.data}
				onCloneNode={() => cloneNodeWithProperSpacing(element.id)}
			/>
		</Node>
	{/each}
</Svelvet>
```

### Важные замечания

1. **UniversalNode** автоматически получит поддержку динамических размеров, так как не задает фиксированные dimensions

2. **Событие размеров** срабатывает только при изменении, не при первом рендере

3. **API метод** требует доступ к graph instance - получайте его через bind:this на Svelvet компоненте

4. **Производительность** - событие использует реактивность Svelte, поэтому обновления эффективны

### Тестирование

1. Откройте демо: http://localhost:5175/dynamic-dimensions
2. Попробуйте добавить/удалить контент в нодах
3. Проверьте консоль для логов событий
4. Нажмите "Получить размеры" для тестирования API

### Следующие шаги

После интеграции в основной проект:

1. Протестируйте клонирование нод с разной высотой
2. Убедитесь, что авто-расстановка учитывает реальные размеры
3. Проверьте сохранение/загрузку workflow с размерами

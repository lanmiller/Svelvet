import type { XYPair } from '$lib/types';

function calculateDotProduct(vector1: XYPair, vector2: XYPair) {
	const product = vector1.x * vector2.x + vector1.y * vector2.y;
	return product;
}

export interface VectorPlusPosition extends XYPair {
	direction: XYPair;
}

// 🎯 НОВЫЕ ИНТЕРФЕЙСЫ ДЛЯ КАСТОМИЗАЦИИ
export interface OrthogonalEdgeOptions {
	cornerRadius?: number;
	stepBuffer?: number;
	bendingRules?: 'smart' | 'minimal' | 'direct';
	preferredDirection?: 'horizontal' | 'vertical' | 'auto';
	avoidOverlap?: boolean;
	maxBends?: number;
}

export interface SmartStepPathOptions extends OrthogonalEdgeOptions {
	// Дополнительные опции для умного алгоритма
	nodeWidth?: number;
	nodeHeight?: number;
	gridSize?: number;
	obstacleAvoidance?: boolean;
}

// 🎯 НОВАЯ УЛУЧШЕННАЯ ФУНКЦИЯ
export function calculateSmartStepPath(
	source: VectorPlusPosition,
	target: VectorPlusPosition,
	options: SmartStepPathOptions = {}
): XYPair[] {
	// Значения по умолчанию
	const {
		cornerRadius = 8,
		stepBuffer = 40,
		bendingRules = 'smart',
		preferredDirection = 'auto',
		avoidOverlap = true,
		maxBends = 4,
		nodeWidth = 200,
		nodeHeight = 100,
		gridSize = 25,
		obstacleAvoidance = false
	} = options;

	const steps: XYPair[] = [];
	const deltaX = target.x - source.x;
	const deltaY = target.y - source.y;
	const absX = Math.abs(deltaX);
	const absY = Math.abs(deltaY);

	// Определяем предпочтительное направление
	let actualPreferredDirection = preferredDirection;
	if (preferredDirection === 'auto') {
		actualPreferredDirection = absX > absY ? 'horizontal' : 'vertical';
	}

	// Алгоритм для разных правил изгибов
	switch (bendingRules) {
		case 'minimal':
			return calculateMinimalBendPath(source, target, stepBuffer, actualPreferredDirection);

		case 'direct':
			return calculateDirectPath(source, target, stepBuffer);

		case 'smart':
		default:
			return calculateSmartPath(source, target, stepBuffer, actualPreferredDirection, maxBends, avoidOverlap);
	}
}

// 🎯 АЛГОРИТМ МИНИМАЛЬНЫХ ИЗГИБОВ (L-образная форма)
function calculateMinimalBendPath(
	source: VectorPlusPosition,
	target: VectorPlusPosition,
	buffer: number,
	preferredDirection: 'horizontal' | 'vertical'
): XYPair[] {
	const steps: XYPair[] = [];
	const deltaX = target.x - source.x;
	const deltaY = target.y - source.y;

	// Выход из исходной ноды
	const sourceExit = {
		x: source.direction.x * buffer,
		y: source.direction.y * buffer
	};
	steps.push(sourceExit);

	if (preferredDirection === 'horizontal') {
		// Сначала горизонтально, потом вертикально
		const horizontalStep = {
			x: deltaX - sourceExit.x - (target.direction.x * buffer),
			y: 0
		};
		const verticalStep = {
			x: 0,
			y: deltaY - sourceExit.y - (target.direction.y * buffer)
		};

		if (horizontalStep.x !== 0) steps.push(horizontalStep);
		if (verticalStep.y !== 0) steps.push(verticalStep);
	} else {
		// Сначала вертикально, потом горизонтально
		const verticalStep = {
			x: 0,
			y: deltaY - sourceExit.y - (target.direction.y * buffer)
		};
		const horizontalStep = {
			x: deltaX - sourceExit.x - (target.direction.x * buffer),
			y: 0
		};

		if (verticalStep.y !== 0) steps.push(verticalStep);
		if (horizontalStep.x !== 0) steps.push(horizontalStep);
	}

	// Вход в целевую ноду
	const targetEntry = {
		x: target.direction.x * buffer,
		y: target.direction.y * buffer
	};
	steps.push(targetEntry);

	return steps;
}

// 🎯 АЛГОРИТМ ПРЯМОГО ПУТИ (максимально прямой с минимальными отступами)
function calculateDirectPath(
	source: VectorPlusPosition,
	target: VectorPlusPosition,
	buffer: number
): XYPair[] {
	const steps: XYPair[] = [];
	const deltaX = target.x - source.x;
	const deltaY = target.y - source.y;

	// Минимальные отступы
	const minBuffer = buffer / 2;

	const sourceExit = {
		x: source.direction.x * minBuffer,
		y: source.direction.y * minBuffer
	};
	steps.push(sourceExit);

	// Прямой путь к цели
	const directStep = {
		x: deltaX - sourceExit.x - (target.direction.x * minBuffer),
		y: deltaY - sourceExit.y - (target.direction.y * minBuffer)
	};

	if (directStep.x !== 0 || directStep.y !== 0) {
		steps.push(directStep);
	}

	// Вход в целевую ноду
	const targetEntry = {
		x: target.direction.x * minBuffer,
		y: target.direction.y * minBuffer
	};
	steps.push(targetEntry);

	return steps;
}

// 🎯 УМНЫЙ АЛГОРИТМ (учитывает направления якорей и препятствия)
function calculateSmartPath(
	source: VectorPlusPosition,
	target: VectorPlusPosition,
	buffer: number,
	preferredDirection: 'horizontal' | 'vertical',
	maxBends: number,
	avoidOverlap: boolean
): XYPair[] {
	const steps: XYPair[] = [];
	const deltaX = target.x - source.x;
	const deltaY = target.y - source.y;
	const absX = Math.abs(deltaX);
	const absY = Math.abs(deltaY);

	// Определяем направления якорей
	const sourceIsHorizontal = Math.abs(source.direction.x) > Math.abs(source.direction.y);
	const targetIsHorizontal = Math.abs(target.direction.x) > Math.abs(target.direction.y);

	// Выход из исходной ноды
	const sourceExit = {
		x: source.direction.x * buffer,
		y: source.direction.y * buffer
	};
	steps.push(sourceExit);

	// Умная логика маршрутизации
	if (sourceIsHorizontal && targetIsHorizontal) {
		// Оба якоря горизонтальные
		if (Math.sign(source.direction.x) === Math.sign(target.direction.x)) {
			// Якоря смотрят в одну сторону
			const midY = (source.y + target.y) / 2;
			steps.push({ x: 0, y: midY - source.y - sourceExit.y });
			steps.push({ x: deltaX - sourceExit.x - (target.direction.x * buffer), y: 0 });
			steps.push({ x: 0, y: target.y - midY });
		} else {
			// Якоря смотрят друг на друга
			const midX = (source.x + target.x) / 2;
			steps.push({ x: midX - source.x - sourceExit.x, y: 0 });
			steps.push({ x: 0, y: deltaY - sourceExit.y - (target.direction.y * buffer) });
			steps.push({ x: target.x - midX, y: 0 });
		}
	} else if (!sourceIsHorizontal && !targetIsHorizontal) {
		// Оба якоря вертикальные
		if (Math.sign(source.direction.y) === Math.sign(target.direction.y)) {
			// Якоря смотрят в одну сторону
			const midX = (source.x + target.x) / 2;
			steps.push({ x: midX - source.x - sourceExit.x, y: 0 });
			steps.push({ x: 0, y: deltaY - sourceExit.y - (target.direction.y * buffer) });
			steps.push({ x: target.x - midX, y: 0 });
		} else {
			// Якоря смотрят друг на друга
			const midY = (source.y + target.y) / 2;
			steps.push({ x: 0, y: midY - source.y - sourceExit.y });
			steps.push({ x: deltaX - sourceExit.x - (target.direction.x * buffer), y: 0 });
			steps.push({ x: 0, y: target.y - midY });
		}
	} else {
		// Смешанные направления - используем предпочтительное направление
		if (preferredDirection === 'horizontal') {
			steps.push({ x: deltaX - sourceExit.x - (target.direction.x * buffer), y: 0 });
			steps.push({ x: 0, y: deltaY - sourceExit.y - (target.direction.y * buffer) });
		} else {
			steps.push({ x: 0, y: deltaY - sourceExit.y - (target.direction.y * buffer) });
			steps.push({ x: deltaX - sourceExit.x - (target.direction.x * buffer), y: 0 });
		}
	}

	// Вход в целевую ноду
	const targetEntry = {
		x: target.direction.x * buffer,
		y: target.direction.y * buffer
	};
	steps.push(targetEntry);

	return steps;
}

// 🎯 ОРИГИНАЛЬНАЯ ФУНКЦИЯ (сохраняем для обратной совместимости)
// This can absolutley be optimized
export function calculateStepPath(
	source: VectorPlusPosition,
	target: VectorPlusPosition,
	buffer: number
) {
	const steps = [];

	const deltaX = target.x - source.x;
	const deltaY = target.y - source.y;

	const sameDirection = areVectorsEqual(source.direction, target.direction);
	const orthogonal = calculateDotProduct(source.direction, target.direction) === 0;
	const crossing = areCrossing(source, target);

	const oppositeSource = multiply(source.direction, -1, -1);
	const oppositeTarget = multiply(target.direction, -1, -1);
	const perpendicularSource = { x: Math.abs(source.direction.y), y: Math.abs(source.direction.x) };

	const sourceDirectionDelta = multiply(
		source.direction,
		deltaX - buffer * source.direction.x * (orthogonal ? 1 : sameDirection ? 0 : 2),
		deltaY - buffer * source.direction.y * (orthogonal ? 1 : sameDirection ? 0 : 2)
	);
	const targetDirectionDelta = multiply(
		target.direction,
		deltaX + buffer * target.direction.x * (orthogonal ? 1 : sameDirection ? 0 : 2),
		deltaY + buffer * target.direction.y * (orthogonal ? 1 : sameDirection ? 0 : 2)
	);

	const sourceReaching =
		Math.sign(sourceDirectionDelta.x) === -1 || Math.sign(sourceDirectionDelta.y) === -1;
	const targetReaching =
		Math.sign(targetDirectionDelta.x) === 1 || Math.sign(targetDirectionDelta.y) === 1;
	const absoluteX = Math.abs(deltaX);
	const absoluteY = Math.abs(deltaY);
	const sourceBuffer = multiply(source.direction, buffer, buffer);
	const oppositeTargetBuffer = multiply(oppositeTarget, buffer, buffer);
	const targetBuffer = multiply(target.direction, buffer, buffer);

	const fullSource = multiply(source.direction, absoluteX, absoluteY);
	const fullTarget = multiply(oppositeTarget, absoluteX, absoluteY);

	const halfSource = multiply(source.direction, absoluteX / 2, absoluteY / 2);
	const halfTarget = multiply(oppositeTarget, absoluteX / 2, absoluteY / 2);

	const fullDelta = multiply(perpendicularSource, deltaX, deltaY);

	const sourceFacingTarget = !crossing && !targetReaching && !sourceReaching;

	const sourceToXBuffer = source.x + sourceBuffer.x;
	const sourceToYBuffer = source.y + sourceBuffer.y;
	const targetToXBuffer = target.x + targetBuffer.x;
	const targetToYBuffer = target.y + targetBuffer.y;

	if (sourceReaching) steps.push(sourceBuffer);

	if (crossing && !targetReaching && !sourceReaching) {
		steps.push(fullSource);
		steps.push(fullTarget);
	} else if (sameDirection) {
		if (!sourceReaching) {
			steps.push(multiply(source.direction, buffer + absoluteX, buffer + absoluteY));
		}
		steps.push(fullDelta);
		if (!targetReaching) {
			steps.push(multiply(oppositeTarget, buffer + absoluteX, buffer + absoluteY));
		}
	} else if (sourceFacingTarget) {
		steps.push(halfSource);
		steps.push(fullDelta);
		steps.push(halfTarget);
	} else if (sourceReaching && targetReaching) {
		if (orthogonal) {
			const xReach = Math.abs(sourceToXBuffer - targetToXBuffer);
			const yReach = Math.abs(sourceToYBuffer - targetToYBuffer);
			steps.push(
				multiply(
					target.direction,
					absoluteX < buffer * 2
						? target.direction.x * (deltaX + target.direction.x * buffer)
						: absoluteX + buffer,
					absoluteY < buffer * 2
						? target.direction.y * (deltaY + target.direction.y * buffer)
						: absoluteY + buffer
				)
			);
			steps.push(multiply(oppositeSource, xReach, yReach));
		} else {
			const xReach = Math.abs(sourceToXBuffer - targetToXBuffer);
			const yReach = Math.abs(sourceToYBuffer - targetToYBuffer);
			steps.push(multiply(perpendicularSource, deltaX / 2, deltaY / 2));
			steps.push(multiply(target.direction, xReach, yReach));
			steps.push(multiply(perpendicularSource, deltaX / 2, deltaY / 2));
		}
	} else if (sourceReaching) {
		const xReach = Math.abs(sourceToXBuffer - target.x);
		const yReach = Math.abs(sourceToYBuffer - target.y);
		steps.push(
			multiply(
				oppositeTarget,
				absoluteX < buffer * 2 ? absoluteX - buffer : absoluteX / 2,
				absoluteY < buffer * 2 ? absoluteY - buffer : absoluteY / 2
			)
		);
		steps.push(multiply(oppositeSource, xReach, yReach));
		steps.push(
			multiply(oppositeTarget, Math.max(buffer, absoluteX / 2), Math.max(buffer, absoluteY / 2))
		);
	} else if (targetReaching) {
		const xReach = Math.abs(targetToXBuffer - source.x);
		const yReach = Math.abs(targetToYBuffer - source.y);
		steps.push(
			multiply(source.direction, Math.max(buffer, absoluteX / 2), Math.max(buffer, absoluteY / 2))
		);
		steps.push(multiply(target.direction, xReach, yReach));
		steps.push(
			multiply(
				source.direction,
				absoluteX < buffer * 2 ? absoluteX - buffer : absoluteX / 2,
				absoluteY < buffer * 2 ? absoluteY - buffer : absoluteY / 2
			)
		);
	}

	if (targetReaching) {
		steps.push(oppositeTargetBuffer);
	}

	return steps;
}

export function areCrossing(vec1: VectorPlusPosition, vec2: VectorPlusPosition) {
	const { x: dx1, y: dy1 } = vec1.direction;
	const { x: dx2, y: dy2 } = vec2.direction;
	const deltaX = vec2.x - vec1.x;
	const deltaY = vec2.y - vec1.y;

	if (dx1 * dy2 === dx2 * dy1) return false;
	return (
		(Math.sign(deltaY) === Math.sign(dy1 + dy2)) !== (Math.sign(deltaX) === Math.sign(dx1 + dx2))
	);
}

function multiply(vector: XYPair, deltaX: number, deltaY: number) {
	return { x: vector.x * deltaX, y: vector.y * deltaY };
}
function areVectorsEqual(vector1: XYPair, vector2: XYPair): boolean {
	return vector1.x === vector2.x && vector1.y === vector2.y;
}

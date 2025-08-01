<script context="module">import { calculateStepPath, calculateRadius, calculatePath } from "../../utils/calculators";
import {
  calculateSmartStepPath
} from "../../utils/calculators/calculateStepPath";
import { onMount, onDestroy, getContext, afterUpdate } from "svelte";
import { directionVectors, stepBuffer } from "../../constants";
import { buildPath, rotateVector } from "../../utils/helpers";
import { buildArcStringKey, constructArcString } from "../../utils/helpers";
import { get } from "svelte/store";
let animationFrameId;
function moveEdge(edgeElement) {
  const parentNode = edgeElement.parentNode;
  if (!parentNode)
    return;
  parentNode.removeChild(edgeElement);
  const newContainer = document.querySelector(`.svelvet-graph-wrapper`);
  if (!newContainer)
    return;
  newContainer.appendChild(edgeElement);
}
</script>

<script>const edgeStore = getContext("edgeStore");
const edgeStyle = getContext("edgeStyle");
const endStyles = getContext("endStyles");
const raiseEdgesOnSelect = getContext("raiseEdgesOnSelect");
const edgesAboveNode = getContext("edgesAboveNode");
const selectedEdgeStore = getContext("selectedEdgeStore");
export let edge = getContext("edge");
export let straight = edgeStyle === "straight";
export let step = edgeStyle === "step";
export let orthogonal = edgeStyle === "orthogonal";
export let smartStep = edgeStyle === "smart-step";
export let minimalStep = edgeStyle === "minimal-step";
export let directStep = edgeStyle === "direct-step";
export let orthogonalOptions = {};
export let start = endStyles[0];
export let end = endStyles[1];
export let animate = false;
export let label = "";
export let enableHover = false;
export let edgeClick = null;
export let labelPosition = 0.5;
export let width = null;
export let color = null;
export let labelColor = null;
export let textColor = null;
export let cornerRadius = 8;
export let targetColor = null;
const source = edge.source;
const target = edge.target;
const sourceDirection = source.direction;
const targetDirection = target.direction;
const sourceRotation = source.rotation;
const targetRotation = target.rotation;
const sourcePositionStore = source.position;
const targetPositionStore = target.position;
const sourceDynamic = source.dynamic;
const targetDynamic = target.dynamic;
const sourceMoving = source.moving;
const targetMoving = target.moving;
const sourceNodePositionStore = source.node?.position;
const targetNodePositionStore = target.node?.position;
const edgeType = edge.type;
const edgeKey = edge.id;
let isSelected = false;
let path;
let DOMPath;
let labelPoint = { x: 0, y: 0 };
let tracking = false;
let prefersVertical = false;
let sourceAbove = false;
let sourceLeft = false;
let hovering = false;
let edgeElement;
$:
  if (selectedEdgeStore) {
    isSelected = $selectedEdgeStore === edgeKey;
  }
$:
  dynamic = $sourceDynamic || $targetDynamic;
$:
  edgeColor = source?.edgeColor || target?.edgeColor || null;
$:
  edgeLabel = edge.label?.text;
$:
  finalColor = color || $edgeColor || null;
$:
  labelText = label || $edgeLabel || "";
$:
  renderLabel = labelText || $$slots.label;
function handleEdgeClick(event) {
  event.stopPropagation();
  event.preventDefault();
  console.log(`\u{1F5B1}\uFE0F \u041A\u043B\u0438\u043A \u043F\u043E \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044E: ${edgeKey}`);
  if (selectedEdgeStore && typeof selectedEdgeStore.set === "function") {
    selectedEdgeStore.set(edgeKey);
    console.log(`\u2705 \u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 ${edgeKey} \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043E`);
  } else {
    console.warn("selectedEdgeStore \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0438\u043B\u0438 \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0441\u0442\u043E\u0440\u043E\u043C");
  }
  if (edgeClick) {
    edgeClick();
  }
}
$:
  sourcePosition = $sourcePositionStore;
$:
  targetPosition = $targetPositionStore;
$:
  sourceNodePosition = $sourceNodePositionStore;
$:
  targetNodePosition = $targetNodePositionStore;
$:
  sourceX = sourcePosition.x;
$:
  sourceY = sourcePosition.y;
$:
  targetX = targetPosition.x;
$:
  targetY = targetPosition.y;
$:
  deltaX = targetX - sourceX;
$:
  deltaY = targetY - sourceY;
$:
  anchorWidth = Math.abs(deltaX);
$:
  anchorHeight = Math.abs(deltaY);
$:
  maxCurveDisplaceX = Math.max(30, Math.min(600, anchorWidth / 2));
$:
  maxCurveDisplaceY = Math.max(30, Math.min(600, anchorHeight / 2));
$:
  sourceControlVector = rotateVector(directionVectors[$sourceDirection], $sourceRotation || 0);
$:
  targetControlVector = rotateVector(directionVectors[$targetDirection], $targetRotation || 0);
$:
  sourceControlX = sourceX + sourceControlVector.x * maxCurveDisplaceX;
$:
  sourceControlY = sourceY + sourceControlVector.y * maxCurveDisplaceY;
$:
  targetControlX = targetX + targetControlVector.x * maxCurveDisplaceX;
$:
  targetControlY = targetY + targetControlVector.y * maxCurveDisplaceY;
$:
  controlPointString = `C ${sourceControlX}, ${sourceControlY} ${targetControlX}, ${targetControlY}`;
$:
  if (!step || edgeKey === "cursor" || $edgeType === "bezier") {
    path = `M ${sourceX}, ${sourceY} ${!straight ? controlPointString : ""} ${targetX}, ${targetY}`;
  }
$:
  if (renderLabel && !tracking && ($sourceMoving || $targetMoving || edgeKey === "cursor")) {
    tracking = true;
    trackPath();
  } else if (tracking && !$sourceMoving && !$targetMoving && edgeKey !== "cursor") {
    tracking = false;
    cancelAnimationFrame(animationFrameId);
  }
$:
  if (dynamic && source.node && target.node) {
    const nodeXDelta = targetNodePosition.x - sourceNodePosition.x;
    const nodeYDelta = targetNodePosition.y - sourceNodePosition.y;
    sourceAbove = nodeYDelta > 0;
    sourceLeft = nodeXDelta > 0;
    let borderDeltaY;
    let borderDeltaX;
    if (sourceAbove) {
      const sourceHeight = get(source.node.dimensions.height);
      const sourceBottom = sourceNodePosition.y + sourceHeight;
      borderDeltaY = targetNodePosition.y - sourceBottom;
    } else {
      const targetHeight = get(target.node.dimensions.height);
      const targetBottom = targetNodePosition.y + targetHeight;
      borderDeltaY = sourceNodePosition.y - targetBottom;
    }
    if (sourceLeft) {
      const sourceWidth = get(source.node.dimensions.width);
      const sourceRight = sourceNodePosition.x + sourceWidth;
      borderDeltaX = targetNodePosition.x - sourceRight;
    } else {
      const targetWidth = get(target.node.dimensions.width);
      const targetRight = targetNodePosition.x + targetWidth;
      borderDeltaX = sourceNodePosition.x - targetRight;
    }
    prefersVertical = borderDeltaY > borderDeltaX;
  }
$:
  if (dynamic) {
    let newSourceDirection;
    let newTargetDirection;
    if (prefersVertical) {
      newSourceDirection = sourceAbove ? "south" : "north";
      newTargetDirection = sourceAbove ? "north" : "south";
    } else {
      newSourceDirection = sourceLeft ? "east" : "west";
      newTargetDirection = sourceLeft ? "west" : "east";
    }
    if ($sourceDynamic)
      $sourceDirection = newSourceDirection;
    if ($targetDynamic)
      $targetDirection = newTargetDirection;
  }
edge.rendered.set(true);
onMount(() => {
  setTimeout(() => {
    if (DOMPath) {
      labelPoint = calculatePath(DOMPath, labelPosition);
    }
  }, 0);
  moveEdge(edgeElement);
});
afterUpdate(() => {
  if (DOMPath) {
    labelPoint = calculatePath(DOMPath, labelPosition);
  }
});
onDestroy(() => {
  edgeElement.remove();
  cancelAnimationFrame(animationFrameId);
});
function trackPath() {
  if (!tracking)
    return;
  if (DOMPath) {
    labelPoint = calculatePath(DOMPath, labelPosition);
  }
  animationFrameId = requestAnimationFrame(trackPath);
}
export function destroy() {
  if (source.id === null || target.id === null)
    return;
  const edgeKey2 = edgeStore.match(source, target);
  edgeStore.delete(edgeKey2[0]);
  source?.connected.update((connected) => {
    if (target)
      connected.delete(target);
    return connected;
  });
  target?.connected.update((connected) => {
    if (source)
      connected.delete(source);
    return connected;
  });
}
$:
  if ((step || orthogonal || smartStep || minimalStep || directStep) && edgeKey !== "cursor" && !($edgeType && $edgeType === "bezier")) {
    const sourceObject = {
      x: sourceX,
      y: sourceY,
      direction: directionVectors[$sourceDirection]
    };
    const targetObject = {
      x: targetX,
      y: targetY,
      direction: directionVectors[$targetDirection]
    };
    let steps;
    if (smartStep) {
      const options = {
        cornerRadius,
        stepBuffer,
        bendingRules: "smart",
        ...orthogonalOptions
      };
      steps = calculateSmartStepPath(sourceObject, targetObject, options);
    } else if (orthogonal) {
      const options = {
        cornerRadius,
        stepBuffer,
        bendingRules: "smart",
        preferredDirection: "auto",
        ...orthogonalOptions
      };
      steps = calculateSmartStepPath(sourceObject, targetObject, options);
    } else if (minimalStep) {
      const options = {
        cornerRadius,
        stepBuffer,
        bendingRules: "minimal",
        ...orthogonalOptions
      };
      steps = calculateSmartStepPath(sourceObject, targetObject, options);
    } else if (directStep) {
      const options = {
        cornerRadius,
        stepBuffer,
        bendingRules: "direct",
        ...orthogonalOptions
      };
      steps = calculateSmartStepPath(sourceObject, targetObject, options);
    } else {
      steps = calculateStepPath(sourceObject, targetObject, stepBuffer);
    }
    const buildArcStringIfNeeded = (step2, index, radius) => {
      if (index < steps.length - 1) {
        const arcStringKey = buildArcStringKey(step2, steps[index + 1]);
        return constructArcString(radius, arcStringKey);
      }
      return "";
    };
    path = steps.reduce((string, step2, index) => {
      const directionX = Math.sign(step2.x);
      const directionY = Math.sign(step2.y);
      let xStep = step2.x;
      let yStep = step2.y;
      let arcString = "";
      if (cornerRadius) {
        const nextStep = steps[index + 1] || { x: 0, y: 0 };
        const previousStep = steps[index - 1] || { x: 0, y: 0 };
        const radiusX = calculateRadius(step2.x, nextStep.x, cornerRadius);
        const radiusY = calculateRadius(nextStep.y, step2.y, cornerRadius);
        const previousRadiusX = calculateRadius(previousStep.x, step2.x, cornerRadius);
        const previousRadiusY = calculateRadius(previousStep.y, step2.y, cornerRadius);
        const previousRadius = Math.min(previousRadiusX, previousRadiusY);
        const radius = Math.min(radiusX, radiusY);
        if (step2.x) {
          xStep = step2.x - (radius + previousRadius) * directionX;
        } else {
          yStep = step2.y - (radius + previousRadius) * directionY;
        }
        arcString = buildArcStringIfNeeded(step2, index, radius);
      }
      return buildPath(string, xStep, yStep, arcString);
    }, `M ${sourceX}, ${sourceY}`);
  }
$:
  sourceZIndex = source.node.zIndex || 0;
$:
  targetZIndex = target.node.zIndex || 0;
$:
  maxZIndex = Math.max($sourceZIndex, $targetZIndex);
$:
  zIndex = edgesAboveNode === "all" ? 1e5 : edgesAboveNode ? maxZIndex : raiseEdgesOnSelect === true ? maxZIndex - 1 : raiseEdgesOnSelect === "source" ? $sourceZIndex - 1 : raiseEdgesOnSelect === "target" ? $targetZIndex - 1 : 0;
</script>

{#if source && target}
	<svg
		class="edges-wrapper"
		class:selected={isSelected}
		style:z-index={zIndex}
		bind:this={edgeElement}
	>
		{#if start || end}
			<defs>
				<marker
					id={edgeKey + '-end-arrow'}
					viewBox="0 0 15 15"
					markerWidth="15"
					markerHeight="10"
					refX="12.5"
					refY="5"
					orient="auto"
				>
					<polygon class="arrow" points="0 0, 15 5, 0 10" style:--prop-edge-color={finalColor} />
				</marker>
				<marker
					id={edgeKey + '-start-arrow'}
					viewBox="0 0 15 15"
					markerWidth="15"
					markerHeight="10"
					refX="0"
					refY="5"
					orient="auto"
				>
					<polygon class="arrow" points="0 5, 15 0, 15 10" style:--prop-edge-color={finalColor} />
				</marker>
			</defs>
		{/if}
		<path
			role="presentation"
			id={edgeKey + '-target'}
			class="target"
			class:cursor={edgeKey === 'cursor'}
			class:selected={isSelected}
			style:cursor="pointer"
			style:--prop-target-edge-color={hovering ? targetColor || '#64748b' : 'transparent'}
			d={path}
			on:click={handleEdgeClick}
			on:mousedown|stopPropagation
			on:mouseenter={() => (hovering = true)}
			on:mouseleave={() => (hovering = false)}
			bind:this={DOMPath}
		/>
		<slot {path} {destroy} {hovering}>
			<path
				id={edgeKey}
				class="edge"
				class:animate
				class:selected={isSelected}
				d={path}
				style:--prop-edge-color={finalColor}
				marker-end={end === 'arrow' ? `url(#${edgeKey + '-end-arrow'})` : ''}
				marker-start={start === 'arrow' ? `url(#${edgeKey + '-start-arrow'})` : ''}
				style:--prop-stroke-width={width ? width + 'px' : null}
			/>
		</slot>

		{#if renderLabel}
			<foreignObject x={labelPoint.x} y={labelPoint.y} width="100%" height="100%">
				<span class="label-wrapper">
					<slot name="label" {destroy} {hovering}>
						<div
							class="default-label"
							style:--prop-label-color={labelColor}
							style:--prop-label-text-color={textColor}
						>
							{labelText}
						</div>
					</slot>
				</span>
			</foreignObject>
		{/if}
	</svg>
{/if}

<style>
	.arrow {
		fill: var(--prop-edge-color, var(--edge-color, var(--default-edge-color))) !important;
	}

	.edge {
		stroke: var(--prop-edge-color, var(--edge-color, var(--default-edge-color)));
		stroke-width: var(--prop-stroke-width, var(--edge-width, var(--default-edge-width)));
		contain: strict;
	}

	/* 🎯 НОВОЕ: Стили для выделенного соединения */
	.edge.selected {
		stroke: #ff4444 !important;
		stroke-width: 4px !important;
		filter: drop-shadow(0 0 6px rgba(255, 68, 68, 0.5));
	}

	.target.selected {
		stroke: #ff4444 !important;
		stroke-width: 12px !important;
		opacity: 0.3 !important;
	}

	.edges-wrapper.selected {
		z-index: 10000 !important;
	}

	.label-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		height: fit-content;
		transform: translate(-50%, -50%);
		pointer-events: auto;
	}

	.edges-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		fill: transparent;
		overflow: visible;
	}

	.target {
		pointer-events: stroke;
		stroke: transparent;
		stroke-width: 20px; /* Увеличиваем область клика */
		fill: none;
		cursor: pointer !important;
	}

	.target:hover {
		stroke: rgba(100, 116, 139, 0.3); /* Серый полупрозрачный при ховере */
	}

	.target.selected:hover {
		stroke: rgba(255, 68, 68, 0.5); /* Красный полупрозрачный для выбранного */
	}

	.cursor {
		pointer-events: none;
	}

	foreignObject {
		overflow: visible;
	}

	path {
		cursor: pointer;
	}

	.animate {
		stroke-dasharray: 5;
		animation: dash 1s linear infinite;
		will-change: stroke-dashoffset;
	}

	.default-label {
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		font-size: 1rem;
		height: 1.5rem;
		border-radius: 5px;
		padding: 10px;
		color: var(--prop-label-text-color, var(--label-text-color, var(--default-label-text-color)));
		background-color: var(--prop-label-color, var(--label-color, var(--default-label-color)));
	}

	@keyframes dash {
		from {
			stroke-dashoffset: 30;
		}
	}
</style>

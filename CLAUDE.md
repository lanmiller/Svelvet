# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fork of Svelvet v11.0.3 - a lightweight Svelte component library for building interactive node-based user interfaces. This fork is customized for the main frontend project located at `/home/isin/evolve/front`.

**Important**: When changes are needed in the main frontend (`/home/isin/evolve/front`), coordinate with the user who will pass the information to the Claude instance managing that project.

### Fork-Specific Customizations

This fork includes several enhancements over the standard Svelvet:

1. **Simplified Anchor IDs** (`useRawId`):

   - Anchors can use simple IDs instead of complex format (`A-${id}/${node.id}`)
   - Enable with `useRawId` prop on Anchor components
   - Located in `src/lib/components/Anchor/Anchor.svelte`

2. **Interactive Edge Deletion**:

   - Edges can be selected and deleted with Delete key
   - Implemented via `selectedEdgeStore` in Svelvet container
   - Visual feedback for selected edges

3. **Enhanced Edge Routing**:

   - New edge styles: `orthogonal`, `smart-step`, `minimal-step`, `direct-step`
   - Smart path calculation for cleaner orthogonal connections
   - Exported utilities: `calculateOrthogonalPath`, `calculateSmartStepPath`

4. **Dynamic Node Dimensions**:

   - Nodes automatically measure their height after rendering
   - API method `graph.getNodeDimensions(nodeId)` returns current dimensions
   - Event `nodeDimensionsChanged` fires when dimensions change
   - Useful for proper node cloning and auto-layout
   - Demo at `/src/routes/dynamic-dimensions/`

5. **Custom Nodes Demo**:
   - Comprehensive demo at `/src/routes/custom-nodes-demo/`
   - Showcases all edge routing algorithms and connection types

## Development Commands

### Essential Commands

```bash
# Start development server (runs on host by default)
npm run dev

# Build library and package
npm run build

# Run all tests (E2E with Playwright)
npm test

# Run unit tests (Vitest)
npm run test:unit

# Run specific E2E test
npx playwright test tests/e2e-tests/[folder]/test.ts

# Run specific unit test
npm run test:unit [filename]

# Type checking
npm run check
npm run check:watch  # Watch mode

# Linting and formatting
npm run lint      # Check code style
npm run format    # Auto-format code

# Package library for distribution
npm run package
```

### Pre-publish Checks

Before publishing, the following are automatically run via `prepublishOnly`:

1. `yarn format` - Format all code
2. `yarn lint` - Lint all code
3. `yarn test` - Run E2E tests
4. `yarn test:unit` - Run unit tests
5. `npm run package` - Build package

## High-Level Architecture

### Core Concepts

1. **Graph Store Architecture**: The application uses a centralized store pattern where all state lives in stores, and components subscribe to relevant slices. The main stores are:

   - `GraphStore`: Global store managing multiple graph instances using a Map-based custom store
   - `CursorStore`: Global cursor position tracking with touch support
   - `EdgeStore`: Specialized store for edge management with connection logic
   - Custom store pattern (`createStore`) that extends Svelte's writable with Map-based operations (add, get, getAll, delete, count)

2. **Component Hierarchy**:

   - `Svelvet` (main container) → provides graph context → child components
   - Components access shared state through Svelte's context API (`setContext`/`getContext`)
   - All components are largely presentational with state in stores
   - Graph instance is created in `onMount` and stored in context

3. **Key Component Interactions**:

   - **Nodes** manage their own anchors and positions, communicating through the graph store
   - **Edges** reactively update based on anchor positions, supporting multiple render styles (bezier, straight, step, smoothstep)
   - **Anchors** handle connection logic with input/output/any rules and multiplicity constraints
   - **Groups** can contain multiple nodes with boundary constraints

4. **Type System**: Comprehensive TypeScript types organized by domain:
   - Graph types (transforms, bounds, GraphKey)
   - Node types (NodeConfig, NodeKey, positions)
   - Edge types (EdgeStyle, EndStyle, paths)
   - Anchor types (input/output/any)
   - Type-safe keys for all entities using template literals

### Directory Structure

- `/src/lib/` - Core library code
  - `/components/` - Individual UI components
    - `/Anchor/` - Connection points
    - `/Node/` - Node components
    - `/Edge/` - Edge rendering
    - `/Group/` - Node grouping
    - `/Minimap/` - Canvas overview
    - `/Controls/` - Zoom/pan controls
    - `/data/` - Data flow components (Knob, Slider, Toggle, etc.)
  - `/containers/` - Container components
    - `/Svelvet/` - Main wrapper
    - `/Background/` - Grid background
    - `/Graph/` - Graph container
  - `/stores/` - State management
  - `/types/` - TypeScript definitions
  - `/utils/` - Utility functions
    - `/calculators/` - Path and position calculations
    - `/creators/` - Factory functions
    - `/helpers/` - General utilities
    - `/savers/` - State persistence (WIP)
- `/src/routes/` - Development examples and test routes
- `/tests/` - Test suites
  - `/e2e-tests/` - Playwright E2E tests
  - `/unit-tests/` - Vitest unit tests
- `/docs/` - Mintlify documentation
- `/Version11 README_1.md/` - Version 11 specific documentation

### Testing Strategy

- **E2E Tests**: Playwright tests run against preview server (port 4173)
  - Tests are in `/tests/e2e-tests/` organized by feature
  - Single worker, 1 retry configured
- **Unit Tests**: Vitest with jsdom environment
  - Tests for utilities and helpers
  - Located in `/tests/unit-tests/`
- **Accessibility Testing**: Uses axe-playwright for a11y checks
- Pre-commit hooks via Husky ensure quality

### Import Conventions

Always use the `$lib` alias for library imports:

```typescript
import { Svelvet, Node, Edge } from '$lib';
import type { GraphStore } from '$lib/types';
```

The library exports include:

- Main export: `./dist/index.js`
- Snap grid utility: `./dist/utils/snapGrid.js`

### Key Architectural Patterns

1. **Store-First Architecture**: All application state lives in stores
2. **Context-Based DI**: Graph instance provided via context to avoid prop drilling
3. **Reactive Data Flow**: Heavy use of Svelte's reactive statements (`$:`) and derived stores
4. **Event-Driven**: Custom event system using `createEventDispatcher` for:
   - `nodeClicked`
   - `connection`
   - `disconnection`
   - `edgeClicked`
   - `edgeChange`
5. **Modular Utilities**: Separated by concern (calculations, creators, helpers)

### Store Implementation Details

The custom store pattern (`src/lib/utils/creators/createStore.ts`) extends Svelte's writable:

```typescript
{
  subscribe, set, update,
  add: (item: T, key: K) => Map<K, T>,
  get: (key: K) => T | null,
  getAll: () => T[],
  delete: (key: K) => boolean,
  count: () => number
}
```

Special stores:

- **EdgeStore**: Adds `match()`, `fetch()`, and `onEdgeChange()` methods for edge-specific operations
- **CursorStore**: Manages mouse/touch positions with separate tracking
- **selectedEdgeStore**: Fork addition for edge selection/deletion functionality

Graph instances are created in component `onMount` and stored in the global GraphStore.

### Component Development Guidelines

When creating or modifying components:

1. Components should be primarily presentational
2. State management belongs in stores
3. Use context API for accessing shared graph state
4. Follow existing patterns for edge styles, node configurations
5. Ensure TypeScript types are properly defined
6. Include accessibility attributes (keyboard navigation, ARIA labels)
7. Support both mouse and touch events

### Using Dynamic Node Dimensions

The fork provides automatic node dimension tracking:

```javascript
// Access graph instance via context
const graph = getContext('graph');

// Get current dimensions of a node
const dimensions = graph.getNodeDimensions('node-id');
// Returns: { width: number, height: number } or null

// Listen for dimension changes
<Node
    id="my-node"
    on:nodeDimensionsChanged={(event) => {
        const { nodeId, oldDimensions, newDimensions } = event.detail;
        console.log(`Node ${nodeId} resized from ${oldDimensions.width}x${oldDimensions.height} to ${newDimensions.width}x${newDimensions.height}`);
    }}
>
    <!-- Dynamic content -->
</Node>
```

This is particularly useful for:

- Cloning nodes with proper spacing
- Auto-layout algorithms
- Collision detection
- Dynamic connectors positioning

### Version 11 Specific Features

1. **Snap-Grid Functionality**:

   - Toggle between free movement and snap-to-grid (200x100 cell size)
   - Located in `/src/lib/utils/snapGrid.ts`
   - Keyboard navigation support

2. **Padlock Functionality**:

   - Lock/unlock nodes to prevent movement
   - Visual padlock icon indicator
   - Maintained locked state during interactions

3. **Dynamic Node Addition**:

   - "Add Node" button for creating nodes at runtime
   - Nodes created with default anchors at random positions
   - Full draggable functionality

4. **Save/Reload State** (Work in Progress):
   - `saveStore.ts` and `reloadStore.ts` for state persistence
   - Currently saves camera position and theme
   - Node positions saved after dragging
   - Full graph reconstruction still needs work

### Keyboard Accessibility

Version 10 introduced keyboard navigation:

- `'l'` - Toggle light/dark mode
- `'d'` - Show drawer component
- `'D'` - Open/close drawer
- `'m'` - Toggle minimap
- `'c'` - Toggle controls
- `'e'` - Show editor component
- `Option+Tab` or `Ctrl+Tab` - Node selection (Note: v11 removed this)

### Configuration

- **TypeScript**: Strict mode enabled, ESNext target
- **Svelte Config**: Uses Vite preprocessor, adapter-auto
- **Vite Config**:
  - Host mode enabled for dev server
  - Vitest configured for jsdom environment
- **Package.json**:
  - Supports Svelte 3.59.2+ and Svelte 4
  - Dependencies: svelvet@^10.0.2, uuid@^11.0.5
  - Extensive dev dependencies for testing and tooling

### Performance Considerations

- Use reactive patterns efficiently
- Leverage Svelte's built-in optimizations
- Store updates should be batched when possible
- Edge calculations are separated into utilities for reuse
- Touch events are handled separately from mouse events for better mobile support

### Debugging Tips

1. **Dev Server Routes**: Multiple example routes available:

   - `/` - Main demo with all features
   - `/custom-nodes-demo` - Fork's custom edge routing showcase
   - `/tests` - E2E test route

2. **Common Issues**:

   - Drawer component: `prop` parameter passed may contain the drawer itself
   - Edge disconnection: Check anchor's `multiple` prop and connection rules
   - Type errors: Ensure imports use `$lib` alias consistently

3. **Testing Specific Features**:

   ```bash
   # Test edge routing algorithms
   npx playwright test tests/e2e-tests/edge-tests/test.ts

   # Test node interactions
   npx playwright test tests/e2e-tests/node/test.ts
   ```

### Known Issues (from Version 11)

1. **Graph Initialization**: Sometimes inconsistent from local storage
2. **Drawer Prop**: Not always reactive across components
3. **Edge Management**: Disconnect function may fail to find edges
4. **Zoom/Translation**: Two-way binding can be inconsistent
5. **Event Dispatching**: Some events don't propagate reliably
6. **Save/Reload**: Full graph reconstruction not yet working

### Development Tips

- Check `/src/routes/` for various feature examples
- The main canvas was recreated in v11 due to DrawerControl issues
- Previous version code available via git checkout:
  - v9: `git checkout 7ba45fdb4bfd349b4f536f61156ff66c76542f8a`
  - v8: `git checkout 377c65b519777d73b06cf8ccd0f6f527818dc906`
- When debugging, check browser console for drawer prop updates
- Edge keys use a specific format for matching in disconnect operations

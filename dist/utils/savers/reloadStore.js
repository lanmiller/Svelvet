import { createGraph, createNode, createAnchor, createEdge } from '../creators';
// added interface for createEdge function
// interface EdgeDataType {
//     connection: { source: Anchor; target: Anchor };
//     component: ComponentType | null;
// }
// store parameter is supposed to be Graph interface?
// store should be passed in as JSON string
// export function reloadStore(store: string) {
// 	// turns JSON string to JS object
// 	// variable to store previous graph
// 	// of type Graph
// 	const object = JSON.parse(store);
// 	// create new graph
// 	// Check if transforms and scale are present and valid
// 	const hasValidTransforms = object.transforms && typeof object.transforms === 'object';
// 	const hasValidScale = hasValidTransforms && typeof object.transforms.scale === 'number';
// 	const defaultScaleValue = 1; // Example default scale
// 	const graph = createGraph(object.id as GraphKey, {
// 		...object,
// 		// initialZoom: object.transforms.scale
// 		initialZoom: hasValidScale ? object.transforms.scale : defaultScaleValue
// 	});
// 	// convert Graph.nodes into array, iterate over it
// 	Object.entries(object.nodes).forEach(([id, node]) => {
// 		//
// 		const nodeProps: NodeConfig = node as NodeConfig;
// const newNode = createNode(nodeProps);
// 		// change nodeProps.anchors to newNode.anchors as Object.entries argument
// 		Object.entries(newNode.anchors).forEach(([id, anchor]) => {
// 			// added all arguments that createAnchor function expects to receive
// 			const newAnchor = createAnchor(
// 				graph,
// 				newNode,
// 				id as AnchorKey,
// 				anchor.position,
// 				{ width: 0, height: 0 },
// 				anchor.store,
// 				anchor.edge,
// 				anchor.type,
// 				// anchor.input,
// 				anchor.direction,
// 				anchor.dynamic,
// 				anchor.key,
// 				anchor.edgeColor
// 			);
// 			newNode.anchors.add(newAnchor, id as AnchorKey);
// 		});
// 		graph.nodes.add(newNode, id as NodeKey);
// 	});
// 	Object.entries(object.edges).forEach(([id, edge]) => {
// 		const edgeData = edge as EdgeDataType;
// 		const newEdge = createEdge(edgeData.connection, edgeData.component);
//         graph.edges.add(newEdge, id as CustomEdgeKey);
//     });
// 	// eslint-disable-next-line no-console
// 	console.log('reconstructed graph:', graph)
// 	return graph;
// }
//--------------------------------------------------breaking down reloadStore to focus on transform prop--------------------------------------------------
// updated by team v.11.0
export function reloadStore(store) {
	// Parse the JSON string back into an object
	const object = JSON.parse(store);
	// console.log('RECONSTRUCTED GRAPH:', object);
	const graph = createGraph(object.id, {
		...object, // 🔥 Esto asegurará que pasamos TODAS las propiedades del objeto
		editable: object.editable,
		direction: object.direction,
		locked: object.locked,
		zoom: object.transforms?.scale ?? 1,
		translation: object.transforms?.translation ?? { x: 0, y: 0 },
		edge: object.edge
	});
	// No need to call `.set` on `transforms.scale` and `transforms.translation` if they're initialized directly within `createGraph`
	// eslint-disable-next-line no-console
	// console.log('reconstructed graph:', graph);
	return graph;
}

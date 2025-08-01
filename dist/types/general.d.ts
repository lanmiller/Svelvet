import type { Writable } from 'svelte/store';
export interface XYPosition {
	x: Writable<number>;
	y: Writable<number>;
}
export interface XYPair {
	x: number;
	y: number;
}
export interface GraphDimensions {
	left: number;
	top: number;
	width: number;
	height: number;
	bottom: number;
	right: number;
}
export interface NodeDOMBounds {
	id: string;
	top: number;
	left: number;
	width: number;
	height: number;
}
export type Theme = 'light' | 'dark' | 'purple' | 'parchment';
export interface ThemeGroup {
	node: CSSColorString;
	border: CSSColorString;
	text: CSSColorString;
	selection: CSSColorString;
	header: CSSColorString;
	edge: CSSColorString;
	anchor: CSSColorString;
	map: CSSColorString;
	controls: CSSColorString;
	dots: CSSColorString;
	alt: CSSColorString;
	primary?: CSSColorString;
}
export type Corner = 'SE' | 'SW' | 'NE' | 'NW';
export interface Dimensions {
	width: Writable<number>;
	height: Writable<number>;
}
export interface InitialDimensions {
	width: number;
	height?: number;
}
export interface ActiveKeys {
	[key: string]: boolean | number;
}
export type BackgroundStyles = 'lines' | 'dots' | 'none';
export type CSSDimensionString = PixelValue | PercentValue | EmValue | RemValue | VwValue | VhValue;
export type PixelValue = `${number}px`;
export type PercentValue = `${number}%`;
export type EmValue = `${number}em`;
export type RemValue = `${number}rem`;
export type VwValue = `${number}vw`;
export type VhValue = `${number}vh`;
export type CSSDimensions = `${number}px}` | `${number}%`;
export type StrictDimenionValue =
	| number
	| PixelValue
	| RemValue
	| EmValue
	| PercentValue
	| VwValue
	| VhValue;
export type XorY = 'x' | 'y';
type OptionalSpace = ' ' | '';
export type CSSColorString =
	| NamedColors
	| `#${string}`
	| RGBString
	| `rgba(${OptionalSpace}${number},${OptionalSpace}${number},${OptionalSpace}${number},${OptionalSpace}${
			| number
			| string}${OptionalSpace})`
	| HSLString
	| `hsla(${OptionalSpace}${number},${OptionalSpace}${number}%,${OptionalSpace}${number}%,${OptionalSpace}${
			| number
			| string}${OptionalSpace})`;
export type RGBString =
	`rgb(${OptionalSpace}${number},${OptionalSpace}${number},${OptionalSpace}${number}${OptionalSpace})`;
export type HSLString =
	`hsl(${OptionalSpace}${number},${OptionalSpace}${number}%,${OptionalSpace}${number}%${OptionalSpace})`;
declare const arrowTuple: readonly ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
export type Arrow = (typeof arrowTuple)[number];
export declare const isArrow: (key: string) => key is Arrow;
type NamedColors =
	| 'aliceblue'
	| 'antiquewhite'
	| 'aqua'
	| 'aquamarine'
	| 'azure'
	| 'beige'
	| 'bisque'
	| 'black'
	| 'blanchedalmond'
	| 'blue'
	| 'blueviolet'
	| 'brown'
	| 'burlywood'
	| 'cadetblue'
	| 'chartreuse'
	| 'chocolate'
	| 'coral'
	| 'cornflowerblue'
	| 'cornsilk'
	| 'crimson'
	| 'cyan'
	| 'darkblue'
	| 'darkcyan'
	| 'darkgoldenrod'
	| 'darkgray'
	| 'darkgreen'
	| 'darkgrey'
	| 'darkkhaki'
	| 'darkmagenta'
	| 'darkolivegreen'
	| 'darkorange'
	| 'darkorchid'
	| 'darkred'
	| 'darksalmon'
	| 'darkseagreen'
	| 'darkslateblue'
	| 'darkslategray'
	| 'darkslategrey'
	| 'darkturquoise'
	| 'darkviolet'
	| 'deeppink'
	| 'deepskyblue'
	| 'dimgray'
	| 'dimgrey'
	| 'dodgerblue'
	| 'firebrick'
	| 'floralwhite'
	| 'forestgreen'
	| 'fuchsia'
	| 'gainsboro'
	| 'ghostwhite'
	| 'gold'
	| 'goldenrod'
	| 'gray'
	| 'green'
	| 'greenyellow'
	| 'grey'
	| 'honeydew'
	| 'hotpink'
	| 'indianred'
	| 'indigo'
	| 'ivory'
	| 'khaki'
	| 'lavender'
	| 'lavenderblush'
	| 'lawngreen'
	| 'lemonchiffon'
	| 'lightblue'
	| 'lightcoral'
	| 'lightcyan'
	| 'lightgoldenrodyellow'
	| 'lightgray'
	| 'lightgreen'
	| 'lightgrey'
	| 'lightpink'
	| 'lightsalmon'
	| 'lightseagreen'
	| 'lightskyblue'
	| 'lightslategray'
	| 'lightslategrey'
	| 'lightsteelblue'
	| 'lightyellow'
	| 'lime'
	| 'limegreen'
	| 'linen'
	| 'magenta'
	| 'maroon'
	| 'mediumaquamarine'
	| 'mediumblue'
	| 'mediumorchid'
	| 'mediumpurple'
	| 'mediumseagreen'
	| 'mediumslateblue'
	| 'mediumspringgreen'
	| 'mediumturquoise'
	| 'mediumvioletred'
	| 'midnightblue'
	| 'mintcream'
	| 'mistyrose'
	| 'moccasin'
	| 'navajowhite'
	| 'navy'
	| 'oldlace'
	| 'olive'
	| 'olivedrab'
	| 'orange'
	| 'orangered'
	| 'orchid'
	| 'palegoldenrod'
	| 'palegreen'
	| 'paleturquoise'
	| 'palevioletred'
	| 'papayawhip'
	| 'peachpuff'
	| 'peru'
	| 'pink'
	| 'plum'
	| 'powderblue'
	| 'purple'
	| 'rebeccapurple'
	| 'red'
	| 'rosybrown'
	| 'royalblue'
	| 'saddlebrown'
	| 'salmon'
	| 'sandybrown'
	| 'seagreen'
	| 'seashell'
	| 'sienna'
	| 'silver'
	| 'skyblue'
	| 'slateblue'
	| 'slategray'
	| 'slategrey'
	| 'snow'
	| 'springgreen'
	| 'steelblue'
	| 'tan'
	| 'teal'
	| 'thistle'
	| 'tomato'
	| 'turquoise'
	| 'violet'
	| 'wheat'
	| 'white'
	| 'whitesmoke'
	| 'yellow'
	| 'yellowgreen'
	| 'transparent';
export {};

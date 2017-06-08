export type Doc = undefined | string | ComputedDoc;

export type ComputedDoc =
  | Concat
  | Indent
  | Align
  | ReseltAlign
  | Group
  | Fill
  | IfBreak
  | LineSuffix
  | LineSuffixBoundary
  | BreakParent
  | Line
  | SoftLine
  | HardLine
  | LiteralLine
  | Cursor;

export interface Concat {
  type: "concat";
  parts: Array<Doc>;
}

export interface Indent {
  type: "indent";
  contents: Doc;
}

export interface Align {
  type: "align";
  contents: Doc;
  n: number;
}

export interface ReseltAlign {
  type: "align";
  contents: Doc;
  n: null;
}

export interface Group {
  type: "group";
  contents: Doc;
  break: boolean;
  expandedStates: Array<Doc>;
}

export interface Fill {
  type: "fill";
  parts: Array<Doc>;
}

export interface IfBreak {
  type: "if-break";
  breakContents: Doc;
  flatContents: Doc;
}

export interface LineSuffix {
  type: "line-suffix";
  contents: Doc;
}

export interface LineSuffixBoundary {
  type: "line-suffix-boundary";
}

export interface BreakParent {
  type: "break-parent";
}

export interface Line {
  type: "line";
  kind: "regular";
}

export interface SoftLine {
  type: "line";
  kind: "soft";
}

export interface HardLine {
  type: "line";
  kind: "hard";
}

export interface LiteralLine {
  type: "line";
  kind: "literal";
}

export interface Cursor {
  type: "cursor";
}

/**
 * Combines an array of parts into a single one.
 * 
 * ```ts
 * concat(["hello", "world"])
 * ```
 */
export declare function concat(parts: Array<Doc>): Doc

/**
 * Increase the level of indentation by given `n` number
 * for the given `contents`.
 * 
 * ```ts
 * indent("Hello")
 * indent(concat(["hello", indent("world")]))
 * ```
 */
export declare function indent(contents: Doc): Doc

/**
 * This is similar to `indent` but it increases the level of indentation
 * for the given `content` by a given `n` fixed number. When using tabs, it's
 * going to print spaces. You should prefer using `indent` whenever possible.
 * 
 * ```ts
 * align(tabWidth, concat(["hello", line, "world"]))
 * ```
 */
export declare function align(n: number, contents: Doc): Doc

export interface GroupSettings {
  shoudBreak?: boolean;
  expandedStates?: Array<Doc>;
}

/**
 * Mark a group of fragments which the printer should try to print on one line.
 * This tell the printer formatter when to break. Groups are usually nested,
 * and the printer will try to fit everything on one line, but if it doesn't
 * fit it will break the outermost group first and try again.
 * It will continue breaking groups until everything fits (or there are no more
 * groups to break).
 * 
 * A document can force parent groups to break by including `breakParent`.
 * A "hard" and "literal" `line` automatically include this so they always
 * break parent groups. Breaks are propagated to all parent groups, so if a
 * deeply nested expression has a hard break, everything with break. This only
 * matters for "hard" breaks, i.e. newlines that are printed no matter what
 * and can be statically analyzed.
 * 
 * For example, an array will try to fit on one line:
 * 
 * ```js
 * [1, "foo", { bar: 2 }]
 * ```
 * 
 * However, if any of the items inside the array have a hard break, the array
 * will always break as well:
 * 
 * ```ts
 * [
 *   1,
 *   function() {
 *     return 2
 *   },
 *   3
 * ]
 * ```
 * 
 * In prettier functions always break after the opening curly brace no matter
 * what, so the array breaks as well for consistent formatting. See the prettier
 * implementation of `ArrayExpression` for an example.
 * 
 * ```ts
 * group(
 *   concat([
 *     "[",
 *     indent(
 *       concat([
 *         line,
 *         join(
 *           concat([",", line]),
 *           path.map(print, "elements")
 *         )
 *       ])
 *     ),
 *     line,
 *     "]"
 *   ])
 * )
 */
export declare function group(contents: Doc, settings?: GroupSettings): Doc

/**
 * This should be used as **last resort** as it triggers an exponential
 * complexity when nested. This will try to print the first option, if it
 * fits use it, otherwise try next one and so on.
 */
export declare function conditionalGroup(
  options: Array<Doc>,
  settings?: GroupSettings
): Doc

/**
 * This is an alternative type of group which behave like text layout: it's
 * going to add a break whenever the next element doesn't fit in the line
 * anymore. The difference with a typical group is that it's not going to
 * break all the separators, just the ones that are at the end of lines.
 * 
 * ```ts
 * fill(["I", line, "love", line, "prettier"])
 * ```
 */
export declare function fill(parts: Array<Doc>): Doc

/**
 * Prints `breakContents` if the current group breaks and prints `flatContents`
 * if it doesn't.
 * 
 * ```ts
 * ifBreak(";", " ")
 * ```
 */
export declare function ifBreak(breakContents: Doc, flatContents: Doc): Doc

export declare function lineSuffix(contents: Doc): Doc

/**
 * In cases where you embed code inside of templates, comments shouldn't be
 * able to leave the code part. `lineSuffixBoundary` is an explicit marker
 * you can use to flush code in addition to newlines.
 * 
 * ```ts
 * concat(["{", lineSuffix(" // comment"), lineSuffixBoundary, "}", hardline])
 * ```
 * will output
 * 
 * ```js
 * { // comment
 * }
 * ```
 * and **not**
 * 
 * ```ts
 * {} // comment
 * ```
 */
export declare const lineSuffixBoundary: Doc;

/**
 * Include this anywhere to force all parent groups to break. See `group` for
 * more info. Example:
 * 
 * ```js
 * group(
 *   concat([
 *     " ",
 *     expr,
 *     " ",
 *     breakParent
 *   ])
 * )
 * ```
 */
export declare const breakParent: Doc;
export declare const line: Doc;

/**
 * Specify a line break. The difference from `line` is that if the
 * expression fits on one line, it will be replaced with nothing.
 */
export declare const softline: Doc;

/**
 * Line break that is **always** included in the output, no matter if the
 * expression fits on one line or not.
 */
export declare const hardline: Doc;

/**
 * Line break that is **always** included in the output, and don't indent
 * the next line. Prettier uses this for template literals.
 */
export declare const literalline: Doc;

/**
 * This is a placeholder value where the cursor is in the original input in
 * order to find where it would be printed.
 */
export declare const cursor: Doc;

/**
 * Join `parts` with a `separator`.
 */
export declare function join(seperator: Doc, parts: Array<Doc>): Doc

export declare function addAlignmentToDoc(
  doc: Doc,
  size: number,
  tabWidth: number
): Doc

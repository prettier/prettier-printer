export type Doc =
  | undefined
  | string
  | ComputedDoc

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
  | Cursor

export interface Concat {
  type: "concat"
  parts: Array<Doc>
}

export interface Indent {
  type: "indent"
  contents: Doc
}

export interface Align {
  type: "align"
  contents:Doc
  n:number
}

export interface ReseltAlign {
  type:"align"
  contents:Doc
  n:null
}

export interface Group { 
  type: "group",
  contents:Doc,
  break:boolean,
  expandedStates:Array<Doc>
}

export interface Fill {
  type: "fill",
  parts: Array<Doc>
}

export interface IfBreak {
  type: "if-break",
  breakContents:Doc
  flatContents:Doc
}

export interface LineSuffix {
  type: "line-suffix",
  contents:Doc
}

export interface LineSuffixBoundary {
  type: "line-suffix-boundary"
}

export interface BreakParent {
  type: "break-parent"
}

export interface Line {
  type: "line"
  kind: "regular"
}

export interface SoftLine {
  type: "line"
  kind: "soft"
}

export interface HardLine {
  type: "line"
  kind: "hard"
}

export interface LiteralLine {
  type: "line"
  kind: "literal"
}

export interface Cursor {
  type: "cursor"
}


/**
 * Combines an array of parts into a single one.
 */
export declare function concat(parts: Array<Doc>): Doc

/**
 * Increase the level of indentation by given `n` number
 * for the given `contents`.
 */
export declare function indent(contents: Doc): Doc

/**
 * This is similar to `indent` but it increases the level of indentation
 * for the given `content` by a given `n` fixed number. When using tabs, it's
 * going to print spaces. You should prefer using `indent` whenever possible.
 */
export declare function align(n: number, contents: Doc): Doc

export interface GroupSettings {
  shoudBreak?: boolean
  expandedStates?: Array<Doc>
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
 * ```
 */
export declare function group(contents: Doc, settings?: GroupSettings): Doc
export declare function conditionalGroup(
  states: Array<Doc>,
  settings?: GroupSettings
): Doc

export declare function fill(parts:Array<Doc>):Doc

export declare function ifBreak(breakContents:Doc, flatContents:Doc):Doc
export declare function lineSuffix(contents:Doc):Doc

export declare const lineSuffixBoundary:Doc
export declare const breakParent:Doc
export declare const line:Doc
export declare const softline:Doc
export declare const hardline:Doc
export declare const literalline:Doc
export declare const cursor:Doc

export declare function join(seperator:Doc, parts:Array<Doc>):Doc
export declare function addAlignmentToDoc(doc:Doc, size:number, tabWidth:number):Doc
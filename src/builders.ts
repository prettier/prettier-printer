export type Doc = string | ComputedDoc

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
  contents: Doc
  n: number
}

export interface ReseltAlign {
  type: "align"
  contents: Doc
  n: null
}

export interface Group {
  type: "group"
  contents: Doc
  break: boolean
  expandedStates: undefined | Array<Doc>
}

export interface Fill {
  type: "fill"
  parts: Array<Doc>
}

export interface IfBreak {
  type: "if-break"
  breakContents: null | Doc
  flatContents: null | Doc
}

export interface LineSuffix {
  type: "line-suffix"
  contents: Doc
}

export interface LineSuffixBoundary {
  type: "line-suffix-boundary"
}

export interface BreakParent {
  type: "break-parent"
}

export interface Line {
  type: "line"
  kind: "space"
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
 * Returns `val` back if it is a valid `Doc` or throws an error
 * otherwise.
 */
const doc = (value: Doc): Doc => {
  if (typeof value === "string") {
    return value
  } else {
    switch (value != null && value.type) {
      case "concat":
        return value
      case "indent":
        return value
      case "align":
        return value
      case "group":
        return value
      case "fill":
        return value
      case "if-break":
        return value
      case "line-suffix":
        return value
      case "line-suffix-boundary":
        return value
      case "break-parent":
        return value
      case "line":
        return value
      case "cursor":
        return value
      default:
        throw new Error(
          `Value ${JSON.stringify(value)} is not a valid document`
        )
    }
  }
}

/**
 * Combines an array of parts into a single one.
 * 
 * ```ts
 * concat(["hello", "world"])
 * ```
 */
export const concat = (parts: Array<Doc>): Doc => {
  // We cannot do this until we change `printJSXElement` to not
  // access the internals of a document directly.
  // if(parts.length === 1) {
  //   // If it's a single document, no need to concat it.
  //   return parts[0];
  // }
  return { type: "concat", parts: parts.map(doc) }
}

/**
 * Increase the level of indentation by given `n` number
 * for the given `contents`.
 * 
 * ```ts
 * indent("Hello")
 * indent(concat(["hello", indent("world")]))
 * ```
 */
export const indent = (contents: Doc): Doc => ({
  type: "indent",
  contents: doc(contents)
})

/**
 * This is similar to `indent` but it increases the level of indentation
 * for the given `content` by a given `n` fixed number. When using tabs, it's
 * going to print spaces. You should prefer using `indent` whenever possible.
 * 
 * ```ts
 * align(tabWidth, concat(["hello", line, "world"]))
 * ```
 */
export const align = (n: number, contents: Doc): Doc => ({
  type: "align",
  contents: doc(contents),
  n
})

export interface GroupSettings {
  shouldBreak: undefined | boolean
  expandedStates: undefined | Array<Doc>
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
 * ```
 */
export const group = (contents: Doc, settings?: GroupSettings): Doc => {
  settings = settings || defaultGroupSettings
  return {
    type: "group",
    contents: doc(contents),
    break: !!settings.shouldBreak,
    expandedStates: settings.expandedStates
  }
}

const defaultGroupSettings: GroupSettings = {
  shouldBreak: undefined,
  expandedStates: undefined
}

/**
 * This should be used as **last resort** as it triggers an exponential
 * complexity when nested. This will try to print the first option, if it
 * fits use it, otherwise try next one and so on.
 */
export const conditionalGroup = (
  options: Array<Doc>,
  settings?: GroupSettings
): Doc =>
  group(
    options[0],
    Object.assign(settings || defaultGroupSettings, { expandedStates: options })
  )

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
export const fill = (parts: Array<Doc>): Doc => ({
  type: "fill",
  parts: parts.map(doc)
})
/**
 * Prints `breakContents` if the current group breaks and prints `flatContents`
 * if it doesn't.
 * 
 * ```ts
 * ifBreak(";", " ")
 * ```
 */
export const ifBreak = (
  breakContents: null | Doc,
  flatContents: null | Doc
): Doc => ({
  type: "if-break",
  breakContents: breakContents == null ? null : doc(breakContents),
  flatContents: flatContents == null ? null : doc(flatContents)
})

/**
 * This is used to implement trailing comments. In practice, it is not practical
 * to find where the line ends and you don't want to accidentally print some
 * code at the end of the comment. `lineSuffix` will buffer the output and
 * flush it before any new line or `lineSuffixBoundary`.
 * 
 * ```ts
 * concat(["a", lineSuffix(" // comment"), ";", hardline])
 * ```
 * 
 * will output
 * 
 * ```ts
 * a; // comment
 * ```
 */
export const lineSuffix = (contents: Doc): Doc => ({
  type: "line-suffix",
  contents: doc(contents)
})

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
export const lineSuffixBoundary: Doc = { type: "line-suffix-boundary" }

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
export const breakParent: Doc = { type: "break-parent" }

/**
 * Line break. If a group fits on one line it prints a single space. If group
 * does not fit it prints line break and an indentetation.
 */
export const line: Doc = { type: "line", kind: "space" }

/**
 * Line break. If a group fits on one line it prints nothing. If group does not
 * fit it behaves same as `line`.
 */
export const softline: Doc = <Doc>{ type: "line", kind: "soft", soft: true }

/**
 * Line break that is **always** behaves as if it did not fit, regardless if
 * the group fits on one line or not.
 */
export const hardline: Doc = concat([
  <Doc>{ type: "line", kind: "hard", hard: true },
  breakParent
])

/**
 * Line break that is **always** behaves as if it did not fit. Unlike other
 * lines though it does not print indetantion after line break. Prettier uses
 * this for template literals.
 */
export const literalline: Doc = concat([
  <Doc>{ type: "line", kind: "literal", hard: true, literal: true },
  breakParent
])

/**
 * This is a placeholder value where the cursor is in the original input in
 * order to find where it would be printed.
 */
export const cursor: Doc = <Doc>{ type: "cursor", placeholder: Symbol() }

/**
 * Join `parts` with a `separator`.
 */
export const join = (seperator: Doc, parts: Array<Doc>): Doc => {
  const separatedParts = []
  for (let i = 0; i < parts.length; i++) {
    if (i !== 0) {
      separatedParts.push(seperator)
    }

    separatedParts.push(parts[i])
  }

  return concat(separatedParts)
}

export const addAlignmentToDoc = (
  contents: Doc,
  size: number,
  tabWidth: number
): Doc => {
  let aligned = contents
  if (size > 0) {
    // Use indent to add tabs for all the levels of tabs we need
    for (let i = 0; i < Math.floor(size / tabWidth); ++i) {
      aligned = indent(aligned)
    }
    // Use align for all the spaces that are needed
    aligned = align(size % tabWidth, aligned)
    // size is absolute from 0 and not relative to the current
    // indentation, so we use -Infinity to reset the indentation to 0
    aligned = align(-Infinity, aligned)
  }

  return aligned
}

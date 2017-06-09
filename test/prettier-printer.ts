import * as printer from ".."
import * as test from "blue-tape"


import {
  Doc,
  concat,
  // join,
  line,
  // softline,
  // hardline,
  // literalline,
  group,
  // conditionalGroup,
  // fill,
  // lineSuffix,
  // lineSuffixBoundary,
  // cursor,
  breakParent,
  // ifBreak,
  // indent,
  // align,
  // addAlignmentToDoc,
  printDocToString,
  // isEmpty,
  // willBreak,
  // isLineNext,
  // traverseDoc,
  // mapDoc,
  // propagateBreaks,
  // printDocToDebug
} from ".."

const print = (printWidth:number, doc:Doc) =>
  printDocToString(doc, {printWidth}).formatted

test("exports", async test => {
  test.equal(typeof printer, "object")
  test.equal(typeof printer.concat, "function")
  test.equal(typeof printer.join, "function")
  test.equal(typeof printer.line, "object")
  test.equal(typeof printer.softline, "object")
  test.equal(typeof printer.hardline, "object")
  test.equal(typeof printer.literalline, "object")
  test.equal(typeof printer.group, "function")
  test.equal(typeof printer.conditionalGroup, "function")
  test.equal(typeof printer.fill, "function")
  test.equal(typeof printer.lineSuffix, "function")
  test.equal(typeof printer.lineSuffixBoundary, "object")
  test.equal(typeof printer.cursor, "object")
  test.equal(typeof printer.breakParent, "object")
  test.equal(typeof printer.ifBreak, "function")
  test.equal(typeof printer.indent, "function")
  test.equal(typeof printer.align, "function")
  test.equal(typeof printer.addAlignmentToDoc, "function")
  test.equal(typeof printer.printDocToString, "function")
  test.equal(typeof printer.isEmpty, "function")
  test.equal(typeof printer.willBreak, "function")
  test.equal(typeof printer.isLineNext, "function")
  test.equal(typeof printer.traverseDoc, "function")
  test.equal(typeof printer.mapDoc, "function")
  test.equal(typeof printer.propagateBreaks, "function")
  test.equal(typeof printer.printDocToDebug, "function")
})

test("concat", async test => {
  test.deepEqual(print(30, concat(["hello", line, "world"])), 'hello\nworld')
  test.deepEqual(print(30, group(concat(["hello", line, "world"]))),
                  'hello world')
  test.deepEqual(print(10, group(concat(["hello", line, "world"]))),
                  'hello\nworld')
})

test("breakParent", async test => {
  const doc = group(
    concat([
      "abcdef", // 1...6
      line, // 7
      group(
        concat([
          "ghi", // 8..10
          line, // 11
          breakParent,
          "jk", // 12..13
          line, // 14
          "l"   // 15
        ])
      ),
      line, // 16
      "mnopq", // 17..21
    ])
  )

  test.deepEqual(print(80, doc), "abcdef ghi jk l mnopq")
  test.deepEqual(print(13, doc), "abcdef\nghi\njk\nl\nmnopq")
  // test.deepEqual(print(11, doc), "123\n45\n7\n9\n.")
})
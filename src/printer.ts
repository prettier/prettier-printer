import { Doc } from "./builders"

export interface Options {
  printWidth: number
  newLine?: string
}

export declare function printDocToString(doc: Doc, options: Options): string

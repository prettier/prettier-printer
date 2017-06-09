import { Doc } from "./builders";

export interface Options {
  printWidth: number;
  newLine?: string;
}

export interface Output {
  formatted:string
  cursor:undefined|number
}

/**
 * Takes document and turns it into a string formatted such that lines fit
 * in the give `options.printWidth`. Optional `options.newLine` string can
 * be passed to default `\n` used for line breaks.
 */
export declare function printDocToString(doc: Doc, options: Options): Output

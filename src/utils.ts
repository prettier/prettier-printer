import {Doc} from "./builders"

export declare function isEmpty(doc:Doc):boolean
export declare function willBreak(doc:Doc):boolean
export declare function isLineNext(doc:Doc):boolean
export declare function traverseDoc(doc:Doc,
                                    onEnter:(doc:Doc) => boolean,
                                    onExit?:(doc:Doc) => void,
                                    shouldTraverseConditionalGroups?:boolean):void
export declare function mapDoc (doc:Doc, f:(input:Doc) => Doc):Doc
export declare function propagateBreaks(doc:Doc):void
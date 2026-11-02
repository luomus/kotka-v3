export type KeysOfUnion<T> = T extends T ? keyof T: never;
export type AsArray<T> = [T] extends [Array<any>] ? T : ([T] extends [undefined] ? T : T[]);

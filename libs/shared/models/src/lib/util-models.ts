export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type AsArray<T> = [T] extends [Array<any>]
  ? T
  : [T] extends [undefined]
    ? T
    : T[];

export type TupleUnion<U extends string, R extends any[] = []> = {
  [S in U]: Exclude<U, S> extends never
    ? [...R, S]
    : TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

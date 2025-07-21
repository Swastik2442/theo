type Nullable<T> = T | null;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

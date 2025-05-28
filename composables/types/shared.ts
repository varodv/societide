type FixedArray<Type, Length extends number> = Array<Type> & { length: Length };

export type {
  FixedArray,
};

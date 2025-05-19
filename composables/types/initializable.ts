interface Initializable<Type = () => void> {
  initialized: Ref<boolean>;
  initialize: Type;
}

export type {
  Initializable,
};

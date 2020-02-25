/// A mapping from string to values of type `T`.
type Dictionary<T=any> = { [key: string]: T }

/// A redux action without any payload.
type Action<Meta=void> = import("redux").Action<string> & { meta?: Meta }

/// A redux with a payload.
type PayloadAction<Payload, Meta=void> = Action<Meta> & { readonly payload: Payload }

/// A type.
interface Type {

  /// The color associated with the type.
  readonly baseColor: import("FunBlocks/Utils/Color")

}

/// A term (e.g. an expression or a variable).
type Term = import("FunBlocks/AST/Terms").Term

/// A FunBlocks' program.
interface Program {

  /// The program's initial state.
  readonly initialState: Term

  /// The program's rewriting rules.
  readonly rules: Array<import("FunBlocks/AST/Terms").Rule>

}

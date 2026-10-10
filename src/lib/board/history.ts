export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

const LIMIT = 100;

export const createHistory = <T>(present: T): History<T> => ({ past: [], present, future: [] });

/** Cambia el estado actual sin registrar historial (vista previa durante un gesto). */
export const replace = <T>(h: History<T>, present: T): History<T> => ({ ...h, present });

/** Cambia el estado y registra el anterior como punto de deshacer. */
export const commit = <T>(h: History<T>, present: T): History<T> => ({
  past: [...h.past, h.present].slice(-LIMIT),
  present,
  future: [],
});

/** Cierra un gesto: `base` es el estado previo a la vista previa. */
export const commitFrom = <T>(h: History<T>, base: T): History<T> =>
  Object.is(base, h.present) ? h : { past: [...h.past, base].slice(-LIMIT), present: h.present, future: [] };

export const undo = <T>(h: History<T>): History<T> =>
  h.past.length === 0
    ? h
    : { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };

export const redo = <T>(h: History<T>): History<T> =>
  h.future.length === 0
    ? h
    : { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };

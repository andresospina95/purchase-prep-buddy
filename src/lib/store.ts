import { useEffect, useState, useCallback, useRef } from "react";
import {
  SEED_CECOS,
  SEED_CONCEPTOS,
  SEED_PROVEEDORES,
  SEED_TEXTOS,
  CORREO_DESTINO_DEFAULT,
} from "./seed";
import type {
  CentroCosto,
  Concepto,
  OrdenCompra,
  Proveedor,
  TextoSugerido,
} from "./types";
import { getKv, setKv, getNextConsecutivo } from "./store.functions";

const KEYS = {
  proveedores: "oc.proveedores",
  cecos: "oc.cecos",
  conceptos: "oc.conceptos",
  textos: "oc.textos",
  ordenes: "oc.ordenes",
  config: "oc.config",
} as const;

type KvKey = (typeof KEYS)[keyof typeof KEYS];

export interface AppConfig {
  correoDestino: string;
  ccDestino: string;
}

const SEED_CONFIG: AppConfig = {
  correoDestino: CORREO_DESTINO_DEFAULT,
  ccDestino: "",
};

/**
 * Hook genérico que sincroniza un valor con la base de datos vía server functions.
 * - Carga inicial desde el servidor
 * - Si no hay nada en el servidor, escribe la semilla
 * - Cada `setValue` envía el estado completo al servidor
 */
function useStored<T>(key: KvKey, seed: T) {
  const [value, setValue] = useState<T>(seed);
  const [, setLoaded] = useState(false);
  const seedRef = useRef(seed);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getKv({ data: { key } });
        if (cancelled) return;
        if (res.json === null) {
          // primera vez: persistimos la semilla
          await setKv({
            data: { key, json: JSON.stringify(seedRef.current) },
          });
          setValue(seedRef.current);
        } else {
          setValue(JSON.parse(res.json) as T);
        }
      } catch (err) {
        console.error(`Error cargando ${key}`, err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(prev)
            : updater;
        // fire-and-forget; los errores se loguean
        setKv({ data: { key, json: JSON.stringify(next) } }).catch((err) =>
          console.error(`Error guardando ${key}`, err),
        );
        return next;
      });
    },
    [key],
  );

  return [value, update] as const;
}

export function useProveedores() {
  return useStored<Proveedor[]>(KEYS.proveedores, SEED_PROVEEDORES);
}
export function useCecos() {
  return useStored<CentroCosto[]>(KEYS.cecos, SEED_CECOS);
}
export function useConceptos() {
  return useStored<Concepto[]>(KEYS.conceptos, SEED_CONCEPTOS);
}
export function useTextos() {
  return useStored<TextoSugerido[]>(KEYS.textos, SEED_TEXTOS);
}
export function useOrdenes() {
  return useStored<OrdenCompra[]>(KEYS.ordenes, []);
}
export function useConfig() {
  return useStored<AppConfig>(KEYS.config, SEED_CONFIG);
}

export async function nextConsecutivo(): Promise<number> {
  const res = await getNextConsecutivo();
  return res.value;
}

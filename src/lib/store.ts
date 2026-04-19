import { useEffect, useState, useCallback } from "react";
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

const KEYS = {
  proveedores: "oc.proveedores",
  cecos: "oc.cecos",
  conceptos: "oc.conceptos",
  textos: "oc.textos",
  ordenes: "oc.ordenes",
  consecutivo: "oc.consecutivo",
  config: "oc.config",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("oc-store", { detail: { key } }));
}

function useStored<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(() => read(key, seed));

  useEffect(() => {
    if (!isBrowser()) return;
    if (localStorage.getItem(key) === null) {
      write(key, seed);
    }
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ key: string }>;
      if (ev.detail?.key === key) setValue(read(key, seed));
    };
    window.addEventListener("oc-store", handler);
    return () => window.removeEventListener("oc-store", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        write(key, next);
        return next;
      });
    },
    [key],
  );

  return [value, update] as const;
}

export interface AppConfig {
  correoDestino: string;
  ccDestino: string;
}

const SEED_CONFIG: AppConfig = {
  correoDestino: CORREO_DESTINO_DEFAULT,
  ccDestino: "",
};

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

export function nextConsecutivo(): number {
  if (!isBrowser()) return 1;
  const current = Number(localStorage.getItem(KEYS.consecutivo) ?? "0");
  const next = current + 1;
  localStorage.setItem(KEYS.consecutivo, String(next));
  return next;
}

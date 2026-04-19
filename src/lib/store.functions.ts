import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { kvGet, kvSet, nextOcConsecutivo } from "./db.server";

const KEYS = [
  "oc.proveedores",
  "oc.cecos",
  "oc.conceptos",
  "oc.textos",
  "oc.ordenes",
  "oc.config",
] as const;
type Key = (typeof KEYS)[number];

const keySchema = z.enum(KEYS);

export const getKv = createServerFn({ method: "GET" })
  .inputValidator((input: { key: Key }) => keySchema.parse(input.key) && input)
  .handler(async ({ data }) => {
    const value = (await kvGet<unknown>(data.key, null)) as unknown as
      | Record<string, unknown>
      | null;
    return { value };
  });

export const setKv = createServerFn({ method: "POST" })
  .inputValidator((input: { key: Key; value: unknown }) => {
    keySchema.parse(input.key);
    return input;
  })
  .handler(async ({ data }) => {
    await kvSet(data.key, data.value);
    return { ok: true };
  });

export const getNextConsecutivo = createServerFn({ method: "POST" }).handler(
  async () => {
    const value = await nextOcConsecutivo();
    return { value };
  },
);

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
  .inputValidator((input: { key: Key }) => {
    keySchema.parse(input.key);
    return input;
  })
  .handler(async ({ data }) => {
    const value = await kvGet<unknown>(data.key, null);
    // Serializamos a string para evitar el chequeo de "ValidateSerializable"
    return { json: value === null ? null : JSON.stringify(value) };
  });

export const setKv = createServerFn({ method: "POST" })
  .inputValidator((input: { key: Key; json: string }) => {
    keySchema.parse(input.key);
    if (typeof input.json !== "string") throw new Error("json debe ser string");
    return input;
  })
  .handler(async ({ data }) => {
    const parsed = JSON.parse(data.json);
    await kvSet(data.key, parsed);
    return { ok: true as const };
  });

export const getNextConsecutivo = createServerFn({ method: "POST" }).handler(
  async () => {
    const value = await nextOcConsecutivo();
    return { value };
  },
);

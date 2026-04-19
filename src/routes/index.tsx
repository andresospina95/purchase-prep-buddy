import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import JSZip from "jszip";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;
import {
  Plus,
  Trash2,
  Paperclip,
  Send,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CecoCombobox } from "@/components/CecoCombobox";
import { toast } from "sonner";
import {
  useCecos,
  useConceptos,
  useConfig,
  useOrdenes,
  useProveedores,
  nextConsecutivo,
} from "@/lib/store";
import type { OrdenCompra, Posicion } from "@/lib/types";
import { buildOcExcel, ocFileName } from "@/lib/excel";
import { formatCOP } from "@/lib/format";

export const Route = createFileRoute("/")({ component: CrearOC });

function emptyPosicion(idx: number): Posicion {
  return {
    posicion: idx,
    valorAntesIva: 0,
    porcentajeIva: 0.19,
    centroCosto: "",
    activoFijo: "",
    concepto: "",
    texto: "",
  };
}

function CrearOC() {
  const [proveedores] = useProveedores();
  const [cecos] = useCecos();
  const [conceptos] = useConceptos();
  const [config] = useConfig();
  const [, setOrdenes] = useOrdenes();
  const navigate = useNavigate();

  const [proveedorId, setProveedorId] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [posiciones, setPosiciones] = useState<Posicion[]>([emptyPosicion(1)]);
  const [expanded, setExpanded] = useState<number[]>([0]);
  const [adjunto, setAdjunto] = useState<File | null>(null);
  const [generando, setGenerando] = useState(false);

  const proveedor = useMemo(
    () => proveedores.find((p) => p.id === proveedorId),
    [proveedores, proveedorId],
  );

  const total = useMemo(
    () =>
      posiciones.reduce(
        (acc, p) => acc + p.valorAntesIva * (1 + p.porcentajeIva),
        0,
      ),
    [posiciones],
  );

  function updatePos(i: number, patch: Partial<Posicion>) {
    setPosiciones((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );
  }
  function isPosCompleta(p: Posicion) {
    return (
      p.valorAntesIva > 0 &&
      !!p.centroCosto &&
      !!p.concepto &&
      p.texto.trim().length > 0
    );
  }
  function addPos() {
    setPosiciones((prev) => {
      const last = prev[prev.length - 1];
      if (!isPosCompleta(last)) {
        toast.error("Completa la posición actual antes de agregar otra", {
          description: "Valor antes de IVA, centro de costo, concepto y texto son obligatorios.",
        });
        setExpanded([prev.length - 1]);
        return prev;
      }
      const next = [...prev, emptyPosicion(prev.length + 1)];
      setExpanded([next.length - 1]);
      return next;
    });
  }
  function removePos(i: number) {
    setPosiciones((prev) => {
      const next = prev
        .filter((_, idx) => idx !== i)
        .map((p, idx) => ({ ...p, posicion: idx + 1 }));
      setExpanded([Math.max(0, next.length - 1)]);
      return next;
    });
  }
  function toggleExpand(i: number) {
    setExpanded((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  async function generarOC() {
    if (!proveedor) return toast.error("Selecciona un proveedor");
    if (!solicitante.trim()) return toast.error("Ingresa el solicitante");
    for (const [i, p] of posiciones.entries()) {
      if (!p.centroCosto) return toast.error(`Posición ${i + 1}: centro de costo requerido`);
      if (!p.concepto) return toast.error(`Posición ${i + 1}: concepto requerido`);
      if (!p.texto.trim()) return toast.error(`Posición ${i + 1}: texto requerido`);
      if (p.valorAntesIva <= 0) return toast.error(`Posición ${i + 1}: valor inválido`);
    }

    setGenerando(true);
    try {
      const numero = nextConsecutivo();
      const orden: OrdenCompra = {
        id: crypto.randomUUID(),
        numero,
        fecha: new Date().toISOString(),
        proveedorId: proveedor.id,
        solicitante: solicitante.trim(),
        posiciones,
        adjuntoNombre: adjunto?.name,
      };

      const xlsx = await buildOcExcel({ orden, proveedor, conceptos, cecos });
      const xlsxName = ocFileName(numero, proveedor.razonSocial);

      let downloadName = xlsxName;
      let downloadBlob: Blob = xlsx;

      if (adjunto) {
        const zip = new JSZip();
        zip.file(xlsxName, xlsx);
        zip.file(adjunto.name, adjunto);
        downloadBlob = await zip.generateAsync({ type: "blob" });
        downloadName = `OC-${String(numero).padStart(5, "0")}_${proveedor.razonSocial.replace(
          /[^a-zA-Z0-9]+/g,
          "_",
        )}.zip`;
      }

      saveAs(downloadBlob, downloadName);

      // Persistir
      setOrdenes((prev) => [orden, ...prev]);

      // Abrir mailto
      const subject = encodeURIComponent(
        `Solicitud OC #${numero} - ${proveedor.razonSocial}`,
      );
      const body = encodeURIComponent(
        `Buen día,\n\nAdjunto el formato para la elaboración de la orden de compra #${numero} a nombre de ${proveedor.razonSocial} (NIT ${proveedor.nit}).\n\n` +
          `Total con IVA: ${formatCOP(total)}\nPosiciones: ${posiciones.length}\n\n` +
          (adjunto ? `Se adjunta también el soporte: ${adjunto.name}\n\n` : "") +
          `Solicitante: ${solicitante}\n\nGracias.`,
      );
      const cc = config.ccDestino ? `&cc=${encodeURIComponent(config.ccDestino)}` : "";
      window.location.href = `mailto:${config.correoDestino}?subject=${subject}${cc}&body=${body}`;

      toast.success(`OC #${numero} generada`, {
        description: "Recuerda adjuntar el archivo descargado al correo.",
        icon: <CheckCircle2 className="h-4 w-4" />,
      });

      navigate({ to: "/historial" });
    } catch (e) {
      console.error(e);
      toast.error("Error al generar la OC", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setGenerando(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nueva orden de compra
          </h1>
          <p className="text-sm text-muted-foreground">
            Diligencia los datos y genera el Excel en el formato oficial.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-2 text-right shadow-[var(--shadow-card)]">
          <div className="text-xs text-muted-foreground">Total con IVA</div>
          <div className="text-xl font-semibold text-foreground">{formatCOP(total)}</div>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label>Proveedor</Label>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.length === 0 && (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    Sin proveedores. Agrégalos en{" "}
                    <Link to="/listas" className="underline">
                      Listas
                    </Link>
                    .
                  </div>
                )}
                {proveedores.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.razonSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>NIT</Label>
            <Input value={proveedor?.nit ?? ""} readOnly placeholder="Auto" />
          </div>
          <div>
            <Label>Solicitante</Label>
            <Input
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              placeholder="Tu usuario o nombre"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Correos del proveedor</Label>
            <Input value={proveedor?.correos ?? ""} readOnly placeholder="Auto" />
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Posiciones</h2>
        <span className="text-xs text-muted-foreground">
          {posiciones.length} {posiciones.length === 1 ? "posición" : "posiciones"}
        </span>
      </div>

      <div className="space-y-3">
        {posiciones.map((p, i) => {
          const iva = p.valorAntesIva * p.porcentajeIva;
          const totalLinea = p.valorAntesIva + iva;
          const isOpen = expanded.includes(i);
          const isLast = i === posiciones.length - 1;
          const conceptoNombre =
            conceptos.find((c) => c.id === p.concepto)?.nombre ?? "Sin concepto";
          return (
            <div key={i}>
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(i)}
                      className="flex flex-1 items-center gap-2 text-left"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {p.posicion}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        Posición {p.posicion}
                      </span>
                      {!isOpen && (
                        <span className="ml-2 truncate text-xs text-muted-foreground">
                          {p.centroCosto || "—"} · {conceptoNombre} ·{" "}
                          {formatCOP(totalLinea)}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => toggleExpand(i)}
                        variant="ghost"
                        size="sm"
                      >
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      {posiciones.length > 1 && (
                        <Button
                          onClick={() => removePos(i)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <Label>Valor antes de IVA <span className="text-destructive">*</span></Label>
                          <Input
                            type="number"
                            min={0}
                            value={p.valorAntesIva || ""}
                            onChange={(e) =>
                              updatePos(i, { valorAntesIva: Number(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label>% IVA</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={p.porcentajeIva}
                            onChange={(e) =>
                              updatePos(i, { porcentajeIva: Number(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calculator className="h-3 w-3" /> IVA calculado
                          </div>
                          <div className="text-sm font-medium">{formatCOP(iva)}</div>
                          <div className="text-xs text-muted-foreground">
                            Total: {formatCOP(totalLinea)}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label>Centro de costo <span className="text-destructive">*</span></Label>
                          <CecoCombobox
                            value={p.centroCosto}
                            onChange={(v) => updatePos(i, { centroCosto: v })}
                            cecos={cecos}
                          />
                        </div>
                        <div>
                          <Label>Concepto <span className="text-destructive">*</span></Label>
                          <Select
                            value={p.concepto}
                            onValueChange={(v) => updatePos(i, { concepto: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              {conceptos.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Activo fijo (opcional)</Label>
                          <Input
                            value={p.activoFijo ?? ""}
                            onChange={(e) => updatePos(i, { activoFijo: e.target.value })}
                            placeholder="Código"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Texto descriptivo <span className="text-destructive">*</span></Label>
                        <Textarea
                          value={p.texto}
                          onChange={(e) => updatePos(i, { texto: e.target.value })}
                          placeholder="Describe ampliamente el bien o servicio (se enviará en mayúsculas)"
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {isLast && (
                <div className="mt-3 flex flex-col items-center gap-1">
                  <Button
                    onClick={addPos}
                    variant="outline"
                    size="sm"
                    disabled={!isPosCompleta(p)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Agregar posición
                  </Button>
                  {!isPosCompleta(p) && (
                    <span className="text-xs text-muted-foreground">
                      Completa los campos obligatorios para agregar otra
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-4 transition-colors hover:bg-muted/60">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {adjunto ? adjunto.name : "Adjuntar PDF o imagen del soporte"}
              </div>
              <div className="text-xs text-muted-foreground">
                Se incluirá junto al Excel en un archivo ZIP.
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf,image/*"
              onChange={(e) => setAdjunto(e.target.files?.[0] ?? null)}
            />
            {adjunto && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setAdjunto(null);
                }}
              >
                Quitar
              </Button>
            )}
          </label>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <Button
          size="lg"
          onClick={generarOC}
          disabled={generando}
          className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)]"
        >
          <Send className="mr-2 h-4 w-4" />
          {generando ? "Generando..." : "Generar OC y enviar"}
        </Button>
      </div>
    </AppShell>
  );
}

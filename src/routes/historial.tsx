import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;
import JSZip from "jszip";
import { Download, Trash2, FileSpreadsheet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCecos, useConceptos, useOrdenes, useProveedores } from "@/lib/store";
import { buildOcExcel, ocFileName } from "@/lib/excel";
import { formatCOP, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/historial")({ component: Historial });

function Historial() {
  const [ordenes, setOrdenes] = useOrdenes();
  const [proveedores] = useProveedores();
  const [cecos] = useCecos();
  const [conceptos] = useConceptos();

  const provMap = useMemo(
    () => new Map(proveedores.map((p) => [p.id, p])),
    [proveedores],
  );

  async function descargar(idx: number) {
    const orden = ordenes[idx];
    const proveedor = provMap.get(orden.proveedorId);
    if (!proveedor) return toast.error("Proveedor no encontrado");
    try {
      const xlsx = await buildOcExcel({ orden, proveedor, conceptos, cecos });
      const name = ocFileName(orden.numero, proveedor.razonSocial);
      if (orden.adjuntoNombre) {
        const zip = new JSZip();
        zip.file(name, xlsx);
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, name.replace(/\.xlsx$/, ".zip"));
        toast.info("Adjunto original no disponible", {
          description: "El soporte se descarga al momento de crear la OC.",
        });
      } else {
        saveAs(xlsx, name);
      }
    } catch (e) {
      toast.error("Error al regenerar", {
        description: e instanceof Error ? e.message : String(e),
      });
    }
  }

  function eliminar(idx: number) {
    if (!confirm("¿Eliminar esta OC del historial?")) return;
    setOrdenes((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Historial de OCs
        </h1>
        <p className="text-sm text-muted-foreground">
          {ordenes.length} {ordenes.length === 1 ? "orden generada" : "órdenes generadas"}
        </p>
      </div>

      {ordenes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileSpreadsheet className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Aún no has generado órdenes de compra.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {ordenes.map((o, i) => {
            const prov = provMap.get(o.proveedorId);
            const total = o.posiciones.reduce(
              (a, p) => a + p.valorAntesIva * (1 + p.porcentajeIva),
              0,
            );
            return (
              <Card key={o.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        OC #{String(o.numero).padStart(5, "0")} ·{" "}
                        {prov?.razonSocial ?? "Proveedor eliminado"}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(o.fecha)} · {o.posiciones.length} posiciones · {o.solicitante}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-semibold text-foreground">
                        {formatCOP(total)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => descargar(i)}
                    disabled={!prov}
                  >
                    <Download className="mr-1 h-4 w-4" /> Re-descargar Excel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => eliminar(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

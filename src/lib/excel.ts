import ExcelJS from "exceljs";
import templateUrl from "@/assets/oc-template.xlsx?url";
import type {
  CentroCosto,
  Concepto,
  OrdenCompra,
  Proveedor,
} from "./types";

export interface BuildExcelArgs {
  orden: OrdenCompra;
  proveedor: Proveedor;
  conceptos: Concepto[];
  cecos: CentroCosto[];
}

/**
 * Rellena el template oficial. La hoja "Formato" tiene encabezados en la fila 3
 * y los datos comienzan en la fila 4. Limpiamos las filas de ejemplo (4..) y
 * escribimos las posiciones de la OC manteniendo estilos y fórmulas.
 */
export async function buildOcExcel({
  orden,
  proveedor,
  conceptos,
  cecos,
}: BuildExcelArgs): Promise<Blob> {
  const res = await fetch(templateUrl);
  const buf = await res.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  const ws = wb.getWorksheet("Formato");
  if (!ws) throw new Error("Hoja 'Formato' no encontrada en el template");

  // Limpiar filas de ejemplo (filas 4..max)
  const startRow = 4;
  const lastRow = ws.actualRowCount;
  for (let r = startRow; r <= lastRow; r++) {
    const row = ws.getRow(r);
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.value = null;
    });
  }

  const fecha = new Date(orden.fecha);
  const conceptoMap = new Map(conceptos.map((c) => [c.id, c.nombre]));
  const cecoMap = new Map(cecos.map((c) => [c.codigo, c.denominacion]));

  orden.posiciones.forEach((p, idx) => {
    const r = startRow + idx;
    const row = ws.getRow(r);
    // A Posicion, B Sociedad, C NIT, D Razon Social, E Vr antes IVA,
    // F Vr IVA, G % IVA, H CECO, I Activo Fijo, J Texto, K Correos, L Fecha, M Solicitante
    row.getCell(1).value = p.posicion;
    row.getCell(2).value = Number(proveedor.sociedad) || proveedor.sociedad;
    row.getCell(3).value = Number(proveedor.nit) || proveedor.nit;
    row.getCell(4).value = proveedor.razonSocial;
    row.getCell(5).value = p.valorAntesIva;
    row.getCell(5).numFmt = '"$"#,##0.00';
    // F = E * G  (IVA)
    row.getCell(6).value = { formula: `E${r}*G${r}` } as ExcelJS.CellFormulaValue;
    row.getCell(6).numFmt = '"$"#,##0.00';
    row.getCell(7).value = p.porcentajeIva;
    row.getCell(7).numFmt = "0%";
    row.getCell(8).value = Number(p.centroCosto) || p.centroCosto;
    if (p.activoFijo) row.getCell(9).value = Number(p.activoFijo) || p.activoFijo;
    const conceptoNombre = conceptoMap.get(p.concepto) ?? "";
    const cecoNombre = cecoMap.get(p.centroCosto) ?? "";
    const textoFinal = `${conceptoNombre}${p.texto}`.toUpperCase();
    row.getCell(10).value = textoFinal;
    row.getCell(11).value = proveedor.correos;
    row.getCell(12).value = fecha;
    row.getCell(12).numFmt = "dd/mm/yyyy";
    row.getCell(13).value = orden.solicitante.toUpperCase();
    // anotación cruzada (no afecta formato)
    void cecoNombre;
    row.commit();
  });

  const out = await wb.xlsx.writeBuffer();
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function ocFileName(numero: number, proveedor: string) {
  const safe = proveedor.replace(/[^a-zA-Z0-9]+/g, "_");
  return `OC-${String(numero).padStart(5, "0")}_${safe}.xlsx`;
}

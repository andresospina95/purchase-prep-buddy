import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCecos, useConceptos, useProveedores } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/listas")({ component: ListasAdmin });

function ListasAdmin() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Administrar listas
        </h1>
        <p className="text-sm text-muted-foreground">
          Mantén actualizados proveedores, centros de costo y conceptos.
        </p>
      </div>

      <Tabs defaultValue="prov" className="w-full">
        <TabsList>
          <TabsTrigger value="prov">Proveedores</TabsTrigger>
          <TabsTrigger value="cecos">Centros de costo</TabsTrigger>
          <TabsTrigger value="conceptos">Conceptos</TabsTrigger>
        </TabsList>
        <TabsContent value="prov" className="mt-4">
          <ProveedoresPanel />
        </TabsContent>
        <TabsContent value="cecos" className="mt-4">
          <CecosPanel />
        </TabsContent>
        <TabsContent value="conceptos" className="mt-4">
          <ConceptosPanel />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ProveedoresPanel() {
  const [items, setItems] = useProveedores();
  const [form, setForm] = useState({
    razonSocial: "",
    nit: "",
    sociedad: "1000",
    correos: "",
  });

  function add() {
    if (!form.razonSocial.trim() || !form.nit.trim())
      return toast.error("Razón social y NIT son requeridos");
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...form, razonSocial: form.razonSocial.toUpperCase() },
    ]);
    setForm({ razonSocial: "", nit: "", sociedad: "1000", correos: "" });
    toast.success("Proveedor agregado");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Proveedores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label>Razón social</Label>
            <Input
              value={form.razonSocial}
              onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
            />
          </div>
          <div>
            <Label>NIT</Label>
            <Input
              value={form.nit}
              onChange={(e) => setForm({ ...form, nit: e.target.value })}
            />
          </div>
          <div>
            <Label>Sociedad</Label>
            <Input
              value={form.sociedad}
              onChange={(e) => setForm({ ...form, sociedad: e.target.value })}
            />
          </div>
          <div>
            <Label>Correos</Label>
            <Input
              value={form.correos}
              onChange={(e) => setForm({ ...form, correos: e.target.value })}
              placeholder="a@x.com;b@x.com"
            />
          </div>
        </div>
        <Button onClick={add} className="w-full md:w-auto">
          <Plus className="mr-1 h-4 w-4" /> Agregar proveedor
        </Button>

        <div className="divide-y divide-border rounded-lg border border-border">
          {items.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Sin proveedores
            </div>
          )}
          {items.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{p.razonSocial}</div>
                <div className="truncate text-xs text-muted-foreground">
                  NIT {p.nit} · Soc. {p.sociedad} · {p.correos || "sin correos"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== p.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CecosPanel() {
  const [items, setItems] = useCecos();
  const [form, setForm] = useState({ codigo: "", denominacion: "", responsable: "" });

  function add() {
    if (!form.codigo.trim() || !form.denominacion.trim())
      return toast.error("Código y denominación requeridos");
    if (items.some((c) => c.codigo === form.codigo))
      return toast.error("Código duplicado");
    setItems((prev) => [
      ...prev,
      { codigo: form.codigo, denominacion: form.denominacion.toUpperCase(), responsable: form.responsable.toUpperCase() },
    ]);
    setForm({ codigo: "", denominacion: "", responsable: "" });
    toast.success("Centro de costo agregado");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Centros de costo ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <Label>Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Denominación</Label>
            <Input
              value={form.denominacion}
              onChange={(e) => setForm({ ...form, denominacion: e.target.value })}
            />
          </div>
          <div>
            <Label>Responsable</Label>
            <Input
              value={form.responsable}
              onChange={(e) => setForm({ ...form, responsable: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> Agregar
        </Button>

        <div className="max-h-[480px] divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {items.map((c) => (
            <div key={c.codigo} className="flex items-center justify-between gap-3 px-4 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {c.codigo} — {c.denominacion}
                </div>
                {c.responsable && (
                  <div className="truncate text-xs text-muted-foreground">{c.responsable}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setItems((prev) => prev.filter((x) => x.codigo !== c.codigo))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ConceptosPanel() {
  const [items, setItems] = useConceptos();
  const [nombre, setNombre] = useState("");

  function add() {
    if (!nombre.trim()) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), nombre: nombre.toUpperCase() }]);
    setNombre("");
    toast.success("Concepto agregado");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conceptos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: DESARROLLOS A LA MEDIDA: "
          />
          <Button onClick={add}>
            <Plus className="mr-1 h-4 w-4" /> Agregar
          </Button>
        </div>
        <div className="divide-y divide-border rounded-lg border border-border">
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <div className="text-sm font-medium text-foreground">{c.nombre}</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== c.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

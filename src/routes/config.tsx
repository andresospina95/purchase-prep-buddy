import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/lib/store";

export const Route = createFileRoute("/config")({ component: ConfigPage });

function ConfigPage() {
  const [config, setConfig] = useConfig();
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Define el destinatario por defecto del correo de solicitud.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Correo de solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Destinatario</Label>
            <Input
              value={config.correoDestino}
              onChange={(e) => setConfig({ ...config, correoDestino: e.target.value })}
              placeholder="CIGO@rentingcolombia.com"
            />
          </div>
          <div>
            <Label>Copia (CC)</Label>
            <Input
              value={config.ccDestino}
              onChange={(e) => setConfig({ ...config, ccDestino: e.target.value })}
              placeholder="opcional"
            />
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

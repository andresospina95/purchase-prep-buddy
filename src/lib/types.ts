export interface Proveedor {
  id: string;
  razonSocial: string;
  nit: string;
  sociedad: string; // ej "1000"
  correos: string; // separados por ;
}

export interface CentroCosto {
  codigo: string;
  denominacion: string;
  responsable?: string;
  departamento?: string;
}

export interface Concepto {
  id: string;
  nombre: string; // ej "DESARROLLOS A LA MEDIDA: "
}

export interface TextoSugerido {
  id: string;
  texto: string;
}

export interface Posicion {
  posicion: number;
  valorAntesIva: number;
  porcentajeIva: number; // default 0.19
  centroCosto: string; // codigo
  activoFijo?: string;
  concepto: string; // id concepto
  texto: string;
}

export interface OrdenCompra {
  id: string;
  numero: number;
  fecha: string; // ISO
  proveedorId: string;
  solicitante: string;
  posiciones: Posicion[];
  adjuntoNombre?: string;
}

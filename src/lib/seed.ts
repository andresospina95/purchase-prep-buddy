import type { CentroCosto, Concepto, Proveedor, TextoSugerido } from "./types";

export const SEED_PROVEEDORES: Proveedor[] = [
  {
    id: "p-tevolvers",
    razonSocial: "T-EVOLVERS",
    nit: "901279026",
    sociedad: "1000",
    correos: "info@t-evolvers.com",
  },
];

export const SEED_CONCEPTOS: Concepto[] = [
  { id: "c-capex", nombre: "CAPEX (NOMBRE PROYECTO): " },
  { id: "c-desarrollos", nombre: "DESARROLLOS A LA MEDIDA: " },
  { id: "c-pruebas", nombre: "PRUEBAS DE SOFTWARE: " },
  { id: "c-nube", nombre: "SERVICIO EN LA NUBE: " },
  { id: "c-nube-ant", nombre: "SERVICIO EN LA NUBE PAGADO X ANTICIPO: " },
];

export const SEED_TEXTOS: TextoSugerido[] = [];

export const SEED_CECOS: CentroCosto[] = [
  { codigo: "300000", denominacion: "GERENCIA GENERAL", responsable: "CARLOS GARCES", departamento: "ADMINISTRACION" },
  { codigo: "300001", denominacion: "GERENCIA TRIBUTARIA", responsable: "MARTIN ALONSO BEDOYA", departamento: "ADMINISTRACION" },
  { codigo: "305000", denominacion: "DIRECCIÓN COMERCIAL", responsable: "ESTEBAN TOUS", departamento: "COMERCIAL" },
  { codigo: "305001", denominacion: "COMERCIAL CORPORATIVO", responsable: "RICARDO NIÑO", departamento: "COMERCIAL" },
  { codigo: "305002", denominacion: "COMERCIAL PERSONAS", responsable: "LUZ ELENA GODOY", departamento: "COMERCIAL" },
  { codigo: "305003", denominacion: "COMERCIAL PYME", responsable: "PAULA ANDREA RUEDA", departamento: "COMERCIAL" },
  { codigo: "305004", denominacion: "GERENCIA CENTRAL COTIZACIONES", responsable: "OLGA LUCIA VALENCIA", departamento: "COMERCIAL" },
  { codigo: "305005", denominacion: "GER COMERCIAL LOCALIZA", responsable: "EDUARDO ANT. RAMIREZ", departamento: "COMERCIAL" },
  { codigo: "305006", denominacion: "COMERCIAL EMPRESARIAL", responsable: "PAULA ANDREA RUEDA", departamento: "COMERCIAL" },
  { codigo: "306000", denominacion: "DIRECCIÓN LOCALIZA", responsable: "ANA MARIA ECHEVERRI", departamento: "COMERCIAL" },
  { codigo: "310000", denominacion: "GER MERCADEO & EXPERIENCIA", responsable: "ANA MARÍA MEDINA", departamento: "COMERCIAL" },
  { codigo: "315000", denominacion: "DIRECCION DE OPERACIONES", responsable: "JORGE IGNACIO CORREA", departamento: "OPERACIONES" },
  { codigo: "315001", denominacion: "GERENCIA DE INGENIERIA", responsable: "JOSE ORLANDO INFANTE", departamento: "OPERACIONES" },
  { codigo: "315002", denominacion: "GERENCIA DE ALIANZAS", responsable: "SANTIAGO VELEZ JARAMILLO", departamento: "OPERACIONES" },
  { codigo: "315007", denominacion: "GERENCIA SOSTENIBILIDAD", responsable: "LAURA FRANCO BERMUDEZ", departamento: "OPERACIONES" },
  { codigo: "315014", denominacion: "GERENCIA GESTIÓN FLOTAS", responsable: "EDISON CARDONA", departamento: "OPERACIONES" },
  { codigo: "315020", denominacion: "GERENCIA DE OPERACIONES LOCALIZA", responsable: "JOHN DIEGO GUERRERO", departamento: "OPERACIONES" },
  { codigo: "320000", denominacion: "DIR. COMER. ACTIVOS", responsable: "SANTIAGO VELEZ JARAMILLO", departamento: "COMERCIAL" },
  { codigo: "320002", denominacion: "GERENCIA DE EXPERIENCIAS", responsable: "ANDREA HERNANDEZ", departamento: "COMERCIAL" },
  { codigo: "330000", denominacion: "GERENCIA GESTION HUMANA", responsable: "ELIZABETH AGUDELO", departamento: "ADMINISTRACION" },
  { codigo: "340000", denominacion: "GERENCIA GESTIÓN CONTABLE", responsable: "GLORIA OSPINA", departamento: "ADMINISTRACION" },
  { codigo: "350000", denominacion: "DIRECCION ADMINISTRATIVA", responsable: "OSCAR ALBERTO BERNAL", departamento: "ADMINISTRACION" },
  { codigo: "350003", denominacion: "GERENCIA SERVICIOS ORGANIZACIONALES", responsable: "DIANA LUCIA MARTINEZ", departamento: "ADMINISTRACION" },
  { codigo: "350004", denominacion: "GERENCIA RENTABILIDAD & COMPETITIVIDAD", responsable: "ANDRES CASTAÑO P.", departamento: "ADMINISTRACION" },
  { codigo: "350005", denominacion: "GERENCIA INFRAESTRUCTURA LOCATIVA", responsable: "JUAN GUILLERMO LONDOÑO", departamento: "ADMINISTRACION" },
  { codigo: "350020", denominacion: "GERENCIA ADMINISTRATIVA LOCALIZA", responsable: "MARGARITA GARCIA", departamento: "ADMINISTRACION" },
  { codigo: "350021", denominacion: "GERENCIA PRESERVACION DE RECURSOS", responsable: "DIEGO ANGULO", departamento: "ADMINISTRACION" },
  { codigo: "350030", denominacion: "GERENCIA FINANCIERA", responsable: "CATALINA ECHEVERRI", departamento: "ADMINISTRACION" },
  { codigo: "370000", denominacion: "DIRECCIÓN DE TRANSFORMACIÓN Y TECNOLOGÍA", responsable: "ANDRES PEREZ", departamento: "ADMINISTRACION" },
  { codigo: "370001", denominacion: "GERENCIA DESARROLLO DE PRODUCTO", responsable: "FABIO ANDRES PUERTA", departamento: "ADMINISTRACION" },
  { codigo: "370002", denominacion: "GERENCIA INFRAESTRUCTURA TECNOLOGÍA", responsable: "DIEGO ALONSO TAMAYO", departamento: "ADMINISTRACION" },
  { codigo: "370003", denominacion: "GERENCIA SOLUCIONES TI", responsable: "ANDRES PEREZ", departamento: "ADMINISTRACION" },
  { codigo: "370004", denominacion: "GERENCIA TRANSFORMACION", responsable: "ANA MARIA RESTREPO", departamento: "ADMINISTRACION" },
  { codigo: "370005", denominacion: "GER. DATOS & ANALITICA", responsable: "MISAEL ANGEL BLANDON", departamento: "ADMINISTRACION" },
  { codigo: "400000", denominacion: "CENTRAL RESERVAS LOCALIZA", responsable: "DIANA CELENY RODRIGUEZ", departamento: "OPERACIONES" },
];

export const CORREO_DESTINO_DEFAULT = "CIGO@rentingcolombia.com";

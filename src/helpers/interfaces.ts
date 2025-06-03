export type Modo = 'ListadoPolizas' | 'EditarPoliza' | 'Reportes';

export interface MovimientoFormData {
    cuenta: string;
    tipo: string;
    monto: number;
    concepto: string;
    referencia: string;
}

export interface MovimientoData extends MovimientoFormData {
    movimientoUUID: string;
    polizaUUID: string;
}

export interface MovimientoConDetalles extends MovimientoData {
  polizaTipo: string;
  polizaFolio: number | string;
  polizaFecha: string | Date;
}

export interface PolizaFormData {
    fecha: string;
    tipo: string;
    folio: number | string;
    concepto: string;
}

export interface PolizaData extends PolizaFormData {
    polizaUUID: string;
}

export interface PolizaStoreData extends PolizaData {
    periodo: string;
    folioUnico: [string, string, number | string];
}

export class Poliza {
    // Propiedades públicas que coinciden con PolizaData
    public fecha: string;
    public tipo: string;
    public folio: number | string;
    public concepto: string;
    public polizaUUID: string;

    // Propiedades privadas para los índices que no quieres exponer directamente
    private _periodo: string;
    private _folioUnico: [string, string, number | string];

    constructor(data: PolizaData) {
        this.fecha = data.fecha;
        this.tipo = data.tipo;
        this.folio = data.folio;
        this.concepto = data.concepto;
        this.polizaUUID = data.polizaUUID;

        // Inicializa las propiedades privadas
        this._periodo = this.obtenerPeriodoDesdeFecha(data.fecha);
        this._folioUnico = [data.tipo, this._periodo, data.folio];
    }

    // Método privado para extraer el período de la fecha (puedes ajustar la lógica)
    private obtenerPeriodoDesdeFecha(fecha: string): string {
        // Asumiendo que la fecha viene en formato 'YYYY-MM-DD' o similar
        const [year, month] = fecha.split('-');
        return `${year}-${month}`; // Formato 'YYYY-MM'
    }

    // Getter para acceder al periodo de forma controlada
    public get periodo(): string {
        return this._periodo;
    }

    // Getter para acceder al folioUnico de forma controlada
    public get folioUnico(): [string, string, number | string] {
        return this._folioUnico;
    }

    // Puedes añadir otros métodos para la lógica de negocio de la póliza
    public obtenerDatosParaAlmacenar(): PolizaStoreData {
        return {
            fecha: this.fecha,
            tipo: this.tipo,
            folio: this.folio,
            concepto: this.concepto,
            polizaUUID: this.polizaUUID,
            periodo: this.periodo,
            folioUnico: this.folioUnico
        };
    }
}
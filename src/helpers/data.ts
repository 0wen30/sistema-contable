import Dexie from "dexie";
import { Poliza, type MovimientoData, type PolizaData, type PolizaStoreData } from "./interfaces";

class ContabilidadDB extends Dexie {

    polizas: Dexie.Table<PolizaStoreData, string>;
    movimientos: Dexie.Table<MovimientoData, string>;

    constructor() {
        super("contabilidad");
        this.version(1).stores({
            polizas: '&polizaUUID, fecha, tipo, folio, periodo, &[tipo+periodo+folio]',
            movimientos: '&movimientoUUID, cuenta, tipo, monto, polizaUUID'
        });
        this.polizas = this.table("polizas");
        this.movimientos = this.table("movimientos");
    }

}

export const db = new ContabilidadDB();

export async function obtenerTodasLasPolizas(): Promise<PolizaStoreData[]> {
    try {
        return await db.polizas.toArray();
    } catch (error) {
        console.error("Error al obtener todas las pólizas:", error);
        throw error;
    }
};

export async function obtenerTodasLosMovs(polizaUUID: string): Promise<MovimientoData[]> {
    try {
        return await db.movimientos.where("polizaUUID").equals(polizaUUID).toArray();
    } catch (error) {
        console.error("Error al obtener todos los movimientos:", error);
        throw error;
    }
};

export async function eliminarPoliza(polizaUUID: string): Promise<boolean> {
    try {
        await db.polizas.delete(polizaUUID);
        return true;
    } catch (error) {
        console.error("Error al eliminar la póliza:", error);
        throw error;
    }
};

export async function eliminarMovimiento(movimientoUUID: string): Promise<boolean> {
    try {
        await db.movimientos.delete(movimientoUUID);
        return true;
    } catch (error) {
        console.error("Error al eliminar el movimiento:", error);
        throw error;
    }
};

export async function obtenerPoliza(polizaUUID: string): Promise<PolizaStoreData | undefined> {
    try {
        return await db.polizas.get(polizaUUID);
    } catch (error) {
        console.error("Error al obtener la póliza:", error);
        throw error;
    }
};

export async function guardarPoliza(polizaData: PolizaData): Promise<string> {
    try {
        const poliza = new Poliza(polizaData);
        const polizaStoreData = poliza.obtenerDatosParaAlmacenar();
        const polizaUUID = await db.polizas.put(polizaStoreData);
        return polizaUUID;
    } catch (error) {
        console.error("Error al guardar la póliza:", error);
        throw error;
    }
};

export async function guardarMovimiento(movimiento: MovimientoData): Promise<string> {
    try {
        const movimientoUUID = await db.movimientos.put(movimiento);
        return movimientoUUID;
    } catch (error) {
        console.error("Error al guardar el movimiento:", error);
        throw error;
    }
};
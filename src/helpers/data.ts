import { Poliza, type MovimientoData, type PolizaData, type PolizaStoreData } from "./interfaces";

function getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const requestIDB: IDBOpenDBRequest = indexedDB.open("contabilidad", 1);

        requestIDB.onerror = (event: Event) => {
            console.error("Error al abrir la base de datos:", (event.target as IDBOpenDBRequest).error);
            reject(new Error("No se pudo abrir la base de datos."));
        };

        requestIDB.onsuccess = () => {
            const db: IDBDatabase = requestIDB.result;
            console.log('Base de datos:', db.name);
            console.log('Versión:', db.version);
            console.log('Estatus:','Conectado');
            console.log('Almacen de objetos:', Array.from(db.objectStoreNames));
            resolve(db);
        };

        requestIDB.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
            console.log("Actualización de la base de datos necesaria. Creando o actualizando Object Stores...");

            if (!db.objectStoreNames.contains("polizas")) {
                let objectStore = db.createObjectStore("polizas", { keyPath: "polizaUUID" });
                objectStore.createIndex("fecha", "fecha", { unique: false });
                objectStore.createIndex("tipo", "tipo", { unique: false });
                objectStore.createIndex("folio", "folio", { unique: false });
                objectStore.createIndex("periodo", "periodo", { unique: false });
                objectStore.createIndex("folioUnico", ["tipo", "periodo", "folio"], { unique: true });
            }

            if (!db.objectStoreNames.contains("movimientos")) {
                let objectStore = db.createObjectStore("movimientos", { keyPath: "movimientoUUID" });
                objectStore.createIndex("cuenta", "cuenta", { unique: false });
                objectStore.createIndex("tipo", "tipo", { unique: false });
                objectStore.createIndex("monto", "monto", { unique: false });
                objectStore.createIndex("polizaUUID", "polizaUUID", { unique: false });
            }

        };
    });
}

export default getDB;

export function obtenerTodasLasPolizas(db: IDBDatabase): Promise<PolizaData[]> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es válida."));
            return;
        }
        const transaction: IDBTransaction = db.transaction("polizas", "readonly");
        const store: IDBObjectStore = transaction.objectStore("polizas");
        const request: IDBRequest = store.getAll();

        request.onsuccess = () => {
            console.log("Polizas:", request.result);
            resolve(request.result as PolizaData[]);
        };

        request.onerror = () => {
            console.error("Error al obtener todas las pólizas");
            reject(new Error("Error al obtener todas las pólizas."));
        };
    });
}

export function obtenerTodasLosMovs(db: IDBDatabase, polizaUUID: string): Promise<MovimientoData[]> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es válida."));
            return;
        }
        const transaction: IDBTransaction = db.transaction("movimientos", "readonly");
        const store: IDBObjectStore = transaction.objectStore("movimientos");
        const request: IDBRequest = store.index("polizaUUID").getAll(polizaUUID);

        request.onsuccess = () => {
            console.log("Movimientos:", request.result);
            resolve(request.result as MovimientoData[]);
        };

        request.onerror = () => {
            console.error("Error al obtener todas las movs");
            reject(new Error("Error al obtener todas las movs."));
        };
    });
}

export function eliminarPoliza(db: IDBDatabase, polizaUUID: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es válida."));
            return;
        }

        const transaction: IDBTransaction = db.transaction(["polizas", "movimientos"], "readwrite");
        const polizasStore: IDBObjectStore = transaction.objectStore("polizas");
        const movimientosStore: IDBObjectStore = transaction.objectStore("movimientos");

        const deletePolizaRequest: IDBRequest = polizasStore.delete(polizaUUID);

        deletePolizaRequest.onerror = (event: Event) => {
            console.error("Error al eliminar la póliza:", (event.target as IDBRequest).error);
            reject(new Error("Error al eliminar la póliza."));
        };

        const movimientosIndex: IDBIndex = movimientosStore.index("polizaUUID");
        const cursorRequest: IDBRequest = movimientosIndex.openCursor(IDBKeyRange.only(polizaUUID));

        cursorRequest.onsuccess = (event: Event) => {
            const cursor: IDBCursorWithValue = (event.target as IDBRequest).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        cursorRequest.onerror = (event: Event) => {
            console.error("Error al eliminar movimientos asociados:", (event.target as IDBRequest).error);
        };

        transaction.oncomplete = () => {
            console.log(`Póliza ${polizaUUID} y sus movimientos eliminados correctamente.`);
            resolve(true);
        };

        transaction.onerror = (event: Event) => {
            console.error("Transacción fallida al eliminar póliza y movimientos:", (event.target as IDBTransaction).error);
            reject(new Error("Fallo la transacción de eliminación de póliza y movimientos."));
        };
    });
}

export function eliminarMovimiento(db: IDBDatabase, movimientoUUID: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es válida."));
            return;
        }

        const transaction: IDBTransaction = db.transaction("movimientos", "readwrite");
        const store: IDBObjectStore = transaction.objectStore("movimientos");
        const request: IDBRequest = store.delete(movimientoUUID);

        request.onsuccess = () => {
            console.log("Movimiento eliminado correctamente:");
            resolve(true);
        };
        request.onerror = () => {
            console.error("Error al eliminar el movimiento");
            reject(new Error("Error al eliminar el movimiento."));
        };
        
    });
}

export function obtenerPoliza(db: IDBDatabase, polizaUUID: string): Promise<PolizaData | undefined> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es válida."));
            return;
        }

        const transaction: IDBTransaction = db.transaction("polizas", "readonly");
        const store: IDBObjectStore = transaction.objectStore("polizas");
        const request: IDBRequest = store.get(polizaUUID);

        request.onsuccess = () => {
            console.log("Póliza obtenida:", request.result);
            resolve(request.result as PolizaData | undefined);
        };

        request.onerror = (event: Event) => {
            console.error("Error al obtener la póliza:", (event.target as IDBRequest).error);
            reject(new Error("Error al obtener la póliza."));
        };
    });
}

export function guardarPoliza(db: IDBDatabase, polizaData: PolizaData): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es válida."));
            return;
        }

        const polizaInstance = new Poliza(polizaData);
        const datosParaGuardar: PolizaStoreData = polizaInstance.obtenerDatosParaAlmacenar();
        const transaction: IDBTransaction = db.transaction("polizas", "readwrite");
        const store: IDBObjectStore = transaction.objectStore("polizas");
        const request: IDBRequest = store.put(datosParaGuardar);

        request.onsuccess = () => {
            console.log("Póliza insertada/actualizada.", datosParaGuardar.polizaUUID);
            resolve(datosParaGuardar.polizaUUID);
        }

        request.onerror = (event: Event) => {
            const error = (event.target as IDBRequest).error;
            console.error("Error al insertar/actualizar la póliza:", error);
            reject(new Error(`Error al insertar/actualizar la póliza: ${error?.name || 'Error desconocido'}: ${error?.message || ''}`));
        }
    });
}

/*
export function guardarPoliza(db: IDBDatabase, poliza: PolizaData): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es valida."));
            return;
        }
        const transaction: IDBTransaction = db.transaction("polizas", "readwrite");
        const store: IDBObjectStore = transaction.objectStore("polizas");

        const request: IDBRequest = store.put(poliza);

        request.onsuccess = () => {
            console.log("Poliza insertada/actualizada.", poliza.polizaUUID);
            resolve(poliza.polizaUUID);
        }

        request.onerror = (event: Event) => {
            const error = (event.target as IDBRequest).error;
            console.error("Error al insertar/actualizar la poliza:", error);
            reject(new Error(`Error al insertar/actualizar la poliza: ${error?.name || 'Error desconocido'}: ${error?.message || ''}`));
        }
    })
}
*/
export function guardarMovimiento(db: IDBDatabase, movimiento: MovimientoData): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("La instancia de la base de datos no es valida."));
            return;
        }
        const transaction: IDBTransaction = db.transaction("movimientos", "readwrite");
        const store: IDBObjectStore = transaction.objectStore("movimientos");
        const request: IDBRequest = store.put(movimiento);

        request.onsuccess = () => {
            console.log("movimiento insertada/actualizada.", movimiento.movimientoUUID);           
            resolve(movimiento.movimientoUUID);
        }

        request.onerror = (event: Event) => {
            const error = (event.target as IDBRequest).error;
            console.error("Error al insertar/actualizar la movimiento:", error);
            reject(new Error(`Error al insertar/actualizar la movimiento: ${error?.name || 'Error desconocido'}: ${error?.message || ''}`));
        }
    })
};
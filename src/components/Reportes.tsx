import { useState } from "react";
import { db } from "../helpers/data";
import { useLiveQuery } from "dexie-react-hooks";
import type { Modo, MovimientoConDetalles } from "../helpers/interfaces";

const Reportes = ({ setModo }: { setModo: (modo: Modo) => void }) => {

    const [cuenta, setCuenta] = useState<string>("");

    const handleCuentaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCuenta(event.target.value);
    };

    const movsFiltradosConDetalles = useLiveQuery(async () => {
        if (!cuenta) return [];
        const movimientos = await db.movimientos.where('cuenta').equals(cuenta).toArray();
        if (movimientos.length === 0) return [];
        const polizasUUIDs = Array.from(new Set(movimientos.map(movimiento => movimiento.polizaUUID)));
        const polizas = await db.polizas.bulkGet(polizasUUIDs);
        const polizasMap = new Map(polizas.map(pol => [pol?.polizaUUID, pol]));
        const movimientosConDetalles: MovimientoConDetalles[] = movimientos.map(mov => {
            const poliza = polizasMap.get(mov.polizaUUID);
            return {
                ...mov,
                polizaTipo: poliza?.tipo || 'N/A',
                polizaFolio: poliza?.folio || 'N/A',
                polizaFecha: poliza?.fecha || new Date(0),
            };
        });
        return movimientosConDetalles;
    }, [cuenta]);

    return (

        <div className="pagina-reportes">
        <button className="btn-reportes" onClick={() => setModo('ListadoPolizas')}>Regresar</button>
        <h1>Reportes</h1>
        <div className="filtrosCuentas">
            <div>
                <label htmlFor="cuenta">Cuenta</label>
                <input onChange={handleCuentaChange} type="text" name="cuenta" value={cuenta} />
            </div>
            <button>Generar</button>
        </div>

        <section className="tabla-movimientos-reportes">
            {movsFiltradosConDetalles && movsFiltradosConDetalles.length > 0 ? (
                <table className="tabla-movimientos">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Folio</th>
                            <th>Cuenta</th>
                            <th>Tipo Mov.</th>
                            <th>Monto</th>
                            <th>Referencia</th>
                            <th>Concepto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movsFiltradosConDetalles.map((movimiento) => (
                            <tr key={movimiento.movimientoUUID}>
                                <td>{movimiento.polizaFecha.toString().split('T')[0]}</td>
                                <td>{movimiento.polizaTipo}</td>
                                <td>{movimiento.polizaFolio}</td>
                                <td>{movimiento.cuenta}</td>
                                <td>{movimiento.tipo}</td>
                                <td>{movimiento.monto.toFixed(2)}</td>
                                <td>{movimiento.referencia}</td>
                                <td>{movimiento.concepto}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay movimientos para mostrar.</p>
            )}
        </section>
    </div>
    )
}

export default Reportes
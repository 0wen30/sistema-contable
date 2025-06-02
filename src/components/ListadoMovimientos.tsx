import { useEffect, useState } from 'react';
import type { MovimientoData } from '../helpers/interfaces';
import getDB, { eliminarMovimiento, obtenerTodasLosMovs } from '../helpers/data';
import NuevoMovimiento from './NuevoMovimiento';
import DatosPoliza from './DatosPoliza';

const ListadoMovimientos = ({ polizaSelected }:{
    polizaSelected: string; 
}) => {
    const [movimientoSeleccionadoUUID, setMovimientoSeleccionadoUUID] = useState<string | null>(null);
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<MovimientoData | null>(null);
    const [movimientos, setMovimientos] = useState<MovimientoData[]>([]);

    const obtenerMovimientos = async () => {
        try {
            const db = await getDB();
            const pol = await obtenerTodasLosMovs(db, polizaSelected);
            setMovimientos(pol);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        obtenerMovimientos();
    }, [polizaSelected]);

    const handleRowClick = (movimiento: MovimientoData) => {
        if (movimientoSeleccionadoUUID === movimiento.movimientoUUID) {
            setMovimientoSeleccionadoUUID(null);
        } else {
            setMovimientoSeleccionadoUUID(movimiento.movimientoUUID);
            setMovimientoSeleccionado(movimiento);
        }
    };

    const eliminarMovimientoSeleccionado = async () => {
        try {
            const db = await getDB();
            if (!movimientoSeleccionadoUUID) return;
            await eliminarMovimiento(db, movimientoSeleccionadoUUID);
            await obtenerMovimientos();
            setMovimientoSeleccionadoUUID(null);
            setMovimientoSeleccionado(null);
        } catch (error) {
            console.error("Error al eliminar movimiento:", error);
        }
    };


    return (
        <div>
            <div className="listado-movimientos-container">
                <DatosPoliza polizaSelected={polizaSelected} />
                {movimientos.length === 0 ? (
                    <p>No hay movimientos para mostrar.</p>
                ) : (
                    <table className="movimientos-table">
                        <thead>
                            <tr>
                                <th>Cuenta</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                                <th>Concepto</th>
                                <th>Referencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((movimiento) => (
                                <tr
                                    key={movimiento.movimientoUUID}
                                    onClick={() => handleRowClick(movimiento)}
                                    className={movimientoSeleccionadoUUID === movimiento.movimientoUUID ? 'fila-seleccionada' : ''}
                                >
                                    <td>{movimiento.cuenta}</td>
                                    <td>{movimiento.tipo}</td>
                                    <td>${movimiento.monto}</td>
                                    <td>{movimiento.concepto}</td>
                                    <td>{movimiento.referencia}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="accionesMovimientos">
                {movimientoSeleccionadoUUID && (
                    <button 
                        onClick={eliminarMovimientoSeleccionado} 
                        className="boton-eliminar"
                    >Eliminar</button>
                )}
                <NuevoMovimiento
                    polizaSelected={polizaSelected}
                    movimientoSeleccionadoUUID={movimientoSeleccionadoUUID}
                    movimientoSeleccionado={movimientoSeleccionado}
                    onMovimientoSaved={obtenerMovimientos} // ✅ Pasa la función para refrescar
                />
            </div>
        </div>
    );
};

export default ListadoMovimientos;
import { useEffect, useState } from 'react';
import getDB, { eliminarPoliza, obtenerTodasLasPolizas } from '../helpers/data';
import type { Modo, PolizaData } from '../helpers/interfaces';
import { NuevaPoliza } from './NuevaPoliza';

function ListadoPolizas({ setModo, setPolizaSelected }: {
    setModo: (modo: Modo) => void;
    setPolizaSelected: React.Dispatch<React.SetStateAction<string>>;
}) {

    const [polizaSeleccionadaUUID, setPolizaSeleccionadaUUID] = useState<string | null>(null);
    const [polizas, setPolizas] = useState<PolizaData[]>([]);

    const handleRowClick = (poliza: PolizaData) => {
        if (polizaSeleccionadaUUID === poliza.polizaUUID) {
            setPolizaSeleccionadaUUID(null);
        } else {
            setPolizaSeleccionadaUUID(poliza.polizaUUID);
            setPolizaSelected(poliza.polizaUUID);
        }
    };

    const eliminarPolizaSeleccionada = async () => {
        try {
            const db = await getDB();
            if (!polizaSeleccionadaUUID) return;
            await eliminarPoliza(db, polizaSeleccionadaUUID);
            obtenerPolizas();
            setPolizaSeleccionadaUUID(null);
        } catch (error) {
            console.log(error);
        }
    };

    const obtenerPolizas = async () => {
        try {
            const db = await getDB();
            const pol = await obtenerTodasLasPolizas(db);
            setPolizas(pol);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => { obtenerPolizas(); }, []);

    const openPoliza = () => { setModo('EditarPoliza'); };

    return (
        <div className="listado-polizas-container">
            <header className="listado-polizas-header">
                <h2>Listado de Pólizas</h2>
                <div className="accionesPolizaList">
                    <button disabled={polizaSeleccionadaUUID === null} onClick={openPoliza} >Abrir Poliza</button>
                    <button onClick={eliminarPolizaSeleccionada} disabled={polizaSeleccionadaUUID === null} className="eliminar" > Eliminar Póliza</button>
                </div>
            </header>
            <div className="polizas">
                <div>
                    {polizas.length === 0 ? (
                        <p>No hay pólizas para mostrar.</p>
                    ) : (
                        <table className="polizas-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Folio</th>
                                    <th>Concepto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {polizas.map((poliza) => (
                                    <tr
                                        key={poliza.polizaUUID}
                                        onClick={() => handleRowClick(poliza)}
                                        className={polizaSeleccionadaUUID === poliza.polizaUUID ? 'fila-seleccionada' : ''}
                                    >
                                        <td>{poliza.fecha}</td>
                                        <td>{poliza.tipo}</td>
                                        <td>{poliza.folio}</td>
                                        <td>{poliza.concepto}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <NuevaPoliza obtenerPolizas={obtenerPolizas} />
            </div>
        </div>
    );
};

export default ListadoPolizas;
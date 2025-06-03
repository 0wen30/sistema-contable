import { useEffect, useState } from 'react';
import { eliminarPoliza, obtenerTodasLasPolizas } from '../helpers/data';
import type { Modo, PolizaData } from '../helpers/interfaces';
import { NuevaPoliza } from './NuevaPoliza';
import TablaPolizas from './TablaPolizas';

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
            if (!polizaSeleccionadaUUID) return;
            await eliminarPoliza(polizaSeleccionadaUUID);
            obtenerPolizas();
            setPolizaSeleccionadaUUID(null);
        } catch (error) {
            console.log(error);
        }
    };

    const obtenerPolizas = async () => {
        try {
            const pol = await obtenerTodasLasPolizas();
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
                <TablaPolizas polizas={polizas} handleRowClick={handleRowClick} polizaSeleccionadaUUID={polizaSeleccionadaUUID} />
                <NuevaPoliza obtenerPolizas={obtenerPolizas} />
            </div>
        </div>
    );
};

export default ListadoPolizas;
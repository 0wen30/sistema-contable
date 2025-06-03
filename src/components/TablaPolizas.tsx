import { useState } from "react";
import type { PolizaData } from "../helpers/interfaces";
import { db } from "../helpers/data";
import { useLiveQuery } from "dexie-react-hooks";

const TablaPolizas = ({ polizas, handleRowClick, polizaSeleccionadaUUID }: {
    polizas: PolizaData[],
    handleRowClick: (poliza: PolizaData) => void,
    polizaSeleccionadaUUID: string | null
}) => {

    const [tipo, setTipo] = useState<string>("ingreso");
    const [periodo, setPeriodo] = useState<{ mes: number, ano: number }>({mes:new Date().getMonth() + 1, ano: new Date().getFullYear()});
    const polizasFiltradas = useLiveQuery(() => {
        const periodoString = periodo.ano.toString() + "-" + (periodo.mes < 10 ? "0" + periodo.mes.toString() : periodo.mes.toString());
        return db.polizas
            .where('tipo')
            .equals(tipo)
            .and((poliza) => poliza.periodo === periodoString)
            .sortBy('folio')
    }, [tipo, periodo]);

    const handleTipoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTipo(event.target.value);
    };

    const handlePeriodoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setPeriodo((prevPeriodo) => ({
            ...prevPeriodo,
            [name]: parseInt(value),
        }));
    };

    return (
        <div>
            {polizas.length === 0 ? (
                <p>No hay pólizas para mostrar.</p>
            ) : (
                <>
                    <div className="filtrosPoliza">
                        <label htmlFor="tipoSelection">Tipo:</label>
                        <select onChange={handleTipoChange} name="tipoSelection">
                            <option value="ingreso">Ingreso</option>
                            <option value="egreso">Egreso</option>
                            <option value="diario">Diario</option>
                        </select>
                        <div>
                            <label htmlFor="periodo">Periodo:</label>
                            <input value={periodo.mes} onChange={handlePeriodoChange} name="mes" type="number" max={12} min={1} />
                            <input value={periodo.ano} onChange={handlePeriodoChange} name="ano" type="number" max={2100} min={2000} />
                        </div>
                    </div>
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
                            {polizasFiltradas?.map((poliza) => (
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
                </>
            )}
        </div>
    )
}

export default TablaPolizas
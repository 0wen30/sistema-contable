import { useEffect, useState } from "react";
import getDB, { obtenerPoliza, guardarPoliza } from "../helpers/data";
import type { PolizaFormData } from "../helpers/interfaces";

function DatosPoliza({ polizaSelected }: { polizaSelected: string }) {
    const [polizaOriginal, setPolizaOriginal] = useState<PolizaFormData | null>(null);
    const [polizaEditada, setPolizaEditada] = useState<PolizaFormData>({
        fecha: new Date().toLocaleString().split(",")[0].replaceAll("/","-"),
        tipo: "ingreso",
        folio: 0,
        concepto: ""
    });
    const [fueModificado, setFueModificado] = useState<boolean>(false);

    const obtenerPolizas = async () => {
        try {
            const db = await getDB();
            const pol = await obtenerPoliza(db, polizaSelected);
            if (!pol) return;
            const datosPolizaCargada: PolizaFormData = {
                fecha: pol.fecha,
                tipo: pol.tipo,
                folio: Number(pol.folio),
                concepto: pol.concepto
            };
            setPolizaOriginal(datosPolizaCargada);
            setPolizaEditada(datosPolizaCargada);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        obtenerPolizas();
    }, [polizaSelected]);

    useEffect(() => {
    if (polizaOriginal && polizaEditada) {
        const isModified =
            polizaOriginal.fecha !== polizaEditada.fecha
            polizaOriginal.tipo !== polizaEditada.tipo ||
            polizaOriginal.folio !== polizaEditada.folio ||
            polizaOriginal.concepto !== polizaEditada.concepto;
        setFueModificado(isModified);
    }
}, [polizaEditada, polizaOriginal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPolizaEditada(prev => ({
            ...prev,
            [name]: name === "folio" ? Number(value) : (name === "fecha" ? value : value)
        }));
    };

    const guardarPolizaActualizada = async () => {
        if (!polizaEditada || !polizaSelected) return;

        try {
            const db = await getDB();
            await guardarPoliza(db, { ...polizaEditada, polizaUUID: polizaSelected, fecha: polizaEditada.fecha }); // Llamamos a tu método guardarPoliza
            setPolizaOriginal(polizaEditada);
            setFueModificado(false);
        } catch (error) {
            console.error("Error al actualizar la póliza:", error);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div className="datosPoliza">
                <input
                    value={polizaEditada.fecha}
                    type="date"
                    id="fecha"
                    name="fecha"
                    onChange={handleChange}
                    required
                />
                <select
                    id="tipo"
                    name="tipo"
                    value={polizaEditada.tipo}
                    onChange={handleChange}
                    required
                >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                    <option value="diario">Diario</option>
                </select>
                <input
                    value={polizaEditada.folio}
                    type="number"
                    id="folio"
                    name="folio"
                    onChange={handleChange}
                    required
                />
                <input
                    value={polizaEditada.concepto}
                    type="text"
                    id="concepto"
                    name="concepto"
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="accionesPoliza">
                <button
                    onClick={guardarPolizaActualizada}
                    disabled={!fueModificado}
                    className="boton-actualizar"
                    style={{ backgroundColor: fueModificado ? '#4CAF50' : '#cccccc', cursor: fueModificado ? 'pointer' : 'not-allowed' }}
                >
                    Actualizar
                </button>
            </div>
        </div>
    )
}
export default DatosPoliza;
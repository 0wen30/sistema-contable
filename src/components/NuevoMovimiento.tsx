import { useState, useEffect } from "react"; // Importa useEffect
import type { MovimientoData, MovimientoFormData } from "../helpers/interfaces";
import getDB, { guardarMovimiento } from "../helpers/data";

const NuevoMovimiento = ({ polizaSelected, movimientoSeleccionadoUUID, movimientoSeleccionado, onMovimientoSaved }: { polizaSelected: string, movimientoSeleccionadoUUID: string | null, movimientoSeleccionado: MovimientoData | null, onMovimientoSaved: () => void }) => {

    const [formData, setFormData] = useState<MovimientoFormData>(movimientoSeleccionado || {
        cuenta: "",
        tipo: "cargo",
        monto: 0,
        referencia: "",
        concepto: ""
    });

    useEffect(() => {
        if (movimientoSeleccionado) {
            setFormData(movimientoSeleccionado);
        } else {
            setFormData({
                cuenta: "",
                tipo: "cargo",
                monto: 0,
                referencia: "",
                concepto: ""
            });
        }
    }, [movimientoSeleccionado]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: name === "monto" ? parseFloat(value) : value
    });
}

    const submitMovimientoForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const db = await getDB();
        const movimientoParaGuardar: MovimientoData = {
            ...formData,
            polizaUUID: polizaSelected,
            movimientoUUID: movimientoSeleccionadoUUID || crypto.randomUUID(),
        };
        if (movimientoSeleccionadoUUID) {
            movimientoParaGuardar.movimientoUUID = movimientoSeleccionadoUUID;
        }
        await guardarMovimiento(db, movimientoParaGuardar);
        onMovimientoSaved();
    }

    return (
        <div>
            <form onSubmit={submitMovimientoForm} id="movimientoForm" className="movimiento-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="cuenta">Cuenta:</label>
                        <input value={formData.cuenta} name="cuenta" onChange={handleChange} type="text" id="cuenta" required />
                    </div>

                    <div className="form-field compact-field">
                        <label htmlFor="tipo">Tipo:</label>
                        <select name="tipo" onChange={handleChange} value={formData.tipo} id="tipoMov" required>
                            <option value="cargo">Cargo</option>
                            <option value="abono">Abono</option>
                        </select>
                    </div>

                    <div className="form-field compact-field">
                        <label htmlFor="monto">Monto:</label>
                        <input value={formData.monto} name="monto" onChange={handleChange} type="number" id="monto" step="0.01" required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="referencia">Referencia:</label>
                        <input value={formData.referencia} name="referencia" onChange={handleChange} type="text" id="referencia" required />
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="concepto">Concepto:</label>
                    <textarea value={formData.concepto} name="concepto" onChange={handleChange} id="conceptoMov" required></textarea>
                </div>

                <button type="submit">
                    {movimientoSeleccionadoUUID ? "Actualizar Movimiento" : "Registrar Nuevo Movimiento"}
                </button>
            </form>
        </div>
    )
}

export default NuevoMovimiento;
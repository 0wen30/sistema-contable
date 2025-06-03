import { useState } from "react"
import type { PolizaData, PolizaFormData } from "../helpers/interfaces"
import { guardarPoliza } from "../helpers/data"


export const NuevaPoliza = ({ obtenerPolizas }: { obtenerPolizas: () => void }) => {

    const [flecha, setflecha] = useState("⬅️")
    const [display, setdisplay] = useState("none")
    const [message, setmessage] = useState("")

    const toogleButton = () => {
        if (display === "none") {
            setflecha("➡️")
            setdisplay("block")
        } else {
            setflecha("⬅️")
            setdisplay("none")
        }
    }

    const [formData, setFormData] = useState<PolizaFormData>({
        fecha: "",
        tipo: "ingreso",
        folio: 1,
        concepto: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "fecha" && e.target instanceof HTMLInputElement) {
            setFormData({ ...formData, [name]: value.split("/").reverse().join("-") });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    }

    const submitPolizaForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const polizaParaGuardar: PolizaData = {
            ...formData,
            folio: Number(formData.folio),
            polizaUUID: crypto.randomUUID()
        };
        try {
            await guardarPoliza(polizaParaGuardar);
        } catch (error: any) {
            if (error && error.message && error.message.includes('ConstraintError')) {
                setmessage('Ya existe una póliza con el mismo folio y tipo.');
            } else {
                setmessage('Error al guardar la póliza: ' + error.message);
            }
            setTimeout(() => {
                setmessage('');
            }, 3000);
        }
        obtenerPolizas();
    }

    return (
        <div>
            <p
                style={{ textAlign: 'right', margin: '0', cursor: 'pointer' }}
                onClick={toogleButton}
            >{flecha}</p>
            <div style={{ display }} id="polizaFormContainer">
                <div>
                    <h2 style={{ textAlign: 'center' }}>Crear Nueva Póliza</h2>
                </div>
                <form id="polizaForm" onSubmit={submitPolizaForm}>
                    <div className="input-group">
                        <div>
                            <label>Fecha:</label>
                            <input
                                onChange={handleChange}
                                type="date"
                                id="fecha"
                                name="fecha"
                                value={formData.fecha}
                                required
                            />
                        </div>
                        <div>
                            <label>Tipo de póliza:</label>
                            <select id="tipo" name="tipo" onChange={handleChange} defaultValue={"ingreso"} required>
                                <option value="ingreso">Ingreso</option>
                                <option value="egreso">Egreso</option>
                                <option value="diario">Diario</option>
                            </select>
                        </div>
                        <div>
                            <label>Folio:</label>
                            <input type="number" id="folio" name="folio" onChange={handleChange} min={1} required />
                        </div>
                    </div>
                    <label>Concepto:</label>
                    <textarea id="concepto" name="concepto" onChange={handleChange} required></textarea>
                    <button type="submit">Enviar</button>
                </form>
                <p className="message" style={{ textAlign: 'center', display: message ? 'block' : 'none', color: 'red' }}>{message}</p>
            </div>
        </div>
    )
}
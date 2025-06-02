import type { Modo } from "../helpers/interfaces";
import ListadoMovimientos from "./ListadoMovimientos";

const EditarPoliza = ({ setModo,polizaSelected }: {
    setModo: (modo: Modo) => void;
    polizaSelected: string;
}) => {
	return (
		<div>
			<header className="listado-polizas-header">
				<h1>Editar Poliza</h1>
				<div className="accionesPolizaList">
					<button onClick={() => setModo('ListadoPolizas')}>Volver</button>
				</div>
			</header>
			<ListadoMovimientos polizaSelected={polizaSelected} />
		</div>
	)
}

export default EditarPoliza;
import { useState } from 'react'
import './App.css'
import ListadoPolizas from './components/ListadoPolizas'
import EditarPoliza from './components/EditarPoliza';
import type { Modo } from './helpers/interfaces'
import Reportes from './components/Reportes';

function App() {

	const [polizaSelected, setPolizaSelected] = useState<string>('');
	const [modo, setModo] = useState<Modo>('ListadoPolizas');

	return (
		<>
			<button 
				className="btn-reportes" 
				style={{ display: modo === 'ListadoPolizas' ? 'block' : 'none' }} 
				onClick={() => setModo('Reportes')}
			>Reportes</button>
			{
				modo === 'Reportes' 
				&& <Reportes 
					setModo={setModo} 
				/>
			}
			{
				modo === 'ListadoPolizas' 
				&& <ListadoPolizas 
					setPolizaSelected={setPolizaSelected} 
					setModo={setModo} 
				/>
			}
			{
				modo === 'EditarPoliza' 
				&& <EditarPoliza 
					polizaSelected={polizaSelected} 
					setModo={setModo} 
				/>
			}
		</>
	)
}

export default App

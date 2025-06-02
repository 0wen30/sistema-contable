import { useState } from 'react'
import './App.css'
import ListadoPolizas from './components/ListadoPolizas'
import EditarPoliza from './components/EditarPoliza';
import type { Modo } from './helpers/interfaces'

function App() {

	const [polizaSelected, setPolizaSelected] = useState<string>('');
	const [modo, setModo] = useState<Modo>('ListadoPolizas');

	return (
		<>
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

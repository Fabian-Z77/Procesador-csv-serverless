import { useEffect, useState } from 'react';
// Importamos los componentes del gráfico
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [estadoSubida, setEstadoSubida] = useState<string>('');

  // 🚨 REEMPLAZA CON TUS URLs 🚨
  const API_URL_LEER = "https://upwkbzsdg2.execute-api.us-east-1.amazonaws.com/default/ObtenerMetricasCSV";
  const API_URL_SUBIR = "https://wm3q498j54.execute-api.us-east-1.amazonaws.com/default/GenerarUrlSubidaS3";
  const API_URL_BORRAR = "https://3uxnl05aa8.execute-api.us-east-1.amazonaws.com/default/EliminarMetricaCSV";

  const obtenerDatos = async () => {
    try {
      const respuesta = await fetch(API_URL_LEER);
      const dataJson = await respuesta.json();
      setDatos(dataJson);
      setCargando(false);
    } catch (error) {
      console.error("Error:", error);
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const manejarSeleccionArchivo = (evento: any) => {
    setArchivoSeleccionado(evento.target.files[0]);
  };

  const subirArchivo = async () => {
    if (!archivoSeleccionado) {
      alert("Por favor selecciona un archivo primero.");
      return;
    }

    setEstadoSubida('Generando pase VIP seguro...');

    try {
      const respuestaFirma = await fetch(`${API_URL_SUBIR}?fileName=${archivoSeleccionado.name}`);
      const datosFirma = await respuestaFirma.json();
      const urlParaSubir = datosFirma.uploadURL;

      setEstadoSubida('Subiendo archivo a S3...');

      const respuestaS3 = await fetch(urlParaSubir, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: archivoSeleccionado 
      });

      if (respuestaS3.ok) {
        setEstadoSubida('✅ ¡Subida exitosa! El backend está procesando...');
        setTimeout(() => {
          obtenerDatos();
          setEstadoSubida('');
        }, 4000);
      } else {
        setEstadoSubida('❌ Error al subir a S3.');
      }
    } catch (error) {
      console.error(error);
      setEstadoSubida('❌ Error en el proceso de subida.');
    }
  };



  // --- NUEVA FUNCIÓN PARA BORRAR ---
  const eliminarRegistro = async (idArchivo: string) => {
    // Pedimos confirmación al usuario para no borrar por accidente
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar las métricas de ${idArchivo}?`);
    if (!confirmar) return;

    try {
      // Hacemos la petición DELETE a AWS
      const respuesta = await fetch(`${API_URL_BORRAR}?id_archivo=${idArchivo}`, {
        method: 'DELETE',
      });

      if (respuesta.ok) {
        alert("Registro eliminado con éxito.");
        obtenerDatos(); // Recargamos la lista automáticamente
      } else {
        alert("Hubo un error al intentar eliminar el registro.");
      }
    } catch (error) {
      console.error("Error al borrar:", error);
      alert("Error de conexión al intentar borrar.");
    }
  };



  // --- NUEVA FUNCIÓN PARA EL GRÁFICO ---
  // Recharts necesita un array de objetos: [{nombre: 'columna1', nulos: 5}, ...]
  const prepararDatosGrafico = (diccionarioNulos: any) => {
    return Object.keys(diccionarioNulos).map(llave => ({
        nombre: llave,
        cantidadNulos: diccionarioNulos[llave]
    }));
  };

  if (cargando) return <h2>Conectando con la nube... ☁️</h2>;

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>📊 Dashboard de Calidad de Datos CSV</h1>

      {/* PANEL DE SUBIDA */}
      <div style={{ background: '#2c2c2c', padding: '20px', borderRadius: '10px', marginBottom: '40px', textAlign: 'center' }}>
        <h3>Subir nuevo dataset (.csv)</h3>
        <input type="file" accept=".csv" onChange={manejarSeleccionArchivo} style={{ marginBottom: '10px' }}/>
        <br />
        <button onClick={subirArchivo} style={{ padding: '10px 20px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
          Subir y Procesar en AWS
        </button>
        <p style={{ color: '#4CAF50', marginTop: '15px', fontWeight: 'bold' }}>{estadoSubida}</p>
      </div>

      {/* PANEL DE RESULTADOS Y GRÁFICOS */}
      <div className="tarjetas-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {datos.map((item, index) => {
          const metricas = JSON.parse(item.datos_procesados);
          const datosParaGrafico = prepararDatosGrafico(metricas.nulos);

          return (
            <div key={index} style={{ background: '#1e1e1e', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
              <h2 style={{ color: '#61dafb' }}>📁 Archivo: {item.id_archivo}</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#61dafb', margin: 0 }}>📁 {item.id_archivo}</h2>
                {/* 👇 EL NUEVO BOTÓN DE BORRAR */}
                <button 
                  onClick={() => eliminarRegistro(item.id_archivo)}
                  style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🗑️ Eliminar
                </button>
              </div>
              <p style={{ fontSize: '1.2rem' }}><strong>Total de filas procesadas:</strong> {metricas.total_registros}</p>
              
              <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>Valores Nulos por Columna</h4>
              
              {/* CONTENEDOR DEL GRÁFICO */}
              <div style={{ width: '100%', height: 350, background: '#2a2a2a', padding: '15px', borderRadius: '8px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosParaGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="nombre" stroke="#ccc" tick={{fill: '#ccc'}} />
                    <YAxis stroke="#ccc" tick={{fill: '#ccc'}} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px', color: '#fff' }}
                        itemStyle={{ color: '#61dafb' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    <Bar dataKey="cantidadNulos" fill="#61dafb" name="Cantidad de celdas vacías" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
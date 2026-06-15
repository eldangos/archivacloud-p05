import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1e1e1e', color: '#fff', minHeight: '100vh' }}>
      <h1>ArchivaCloud - Pareja 05</h1>
      
      {/* Feature Extra Obligatoria P-05 (NO BORRAR) */}
      <div style={{ backgroundColor: '#005f73', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>Archivos subidos esta semana: 0</h3>
      </div>

      {/* SECCIÓN 1: Lista de archivos (Lo nuevo que pidió Dilan) */}
      <div style={{ border: '1px solid #555', padding: '20px', maxWidth: '500px', marginBottom: '20px', borderRadius: '5px' }}>
        <p>Archivos encontrados: 2</p>
        <p>----------------------------------------</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>📄 prueba.pdf</span>
          <button style={{ cursor: 'pointer', backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px' }}>[Eliminar]</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>🖼️ foto.jpg</span>
          <button style={{ cursor: 'pointer', backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px' }}>[Eliminar]</button>
        </div>
        
        <p>----------------------------------------</p>
      </div>

      {/* SECCIÓN 2: Subida de archivos (Lo que ya tenías) */}
      <div style={{ border: '1px solid #555', padding: '20px', maxWidth: '500px', borderRadius: '5px' }}>
        <h2>Subir nuevo archivo</h2>
        <p style={{ fontSize: '14px', color: '#aaa' }}>
          Formatos permitidos: <b>PDF, JPG</b> | Tamaño máximo: <b>12 MB</b>
        </p>
        
        <input 
          type="file" 
          accept=".pdf, .jpg, .jpeg" 
          style={{ display: 'block', margin: '15px 0' }} 
        />
        
        <button style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white', border: 'none' }}>
          [Subir]
        </button>
      </div>
    </div>
  )
}

export default App
import React from 'react'





function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ArchivaCloud - Pareja 05</h1>
      
      {/* Feature Extra Obligatoria P-05 */}
      <div style={{ backgroundColor: '#e0f7fa', padding: '10px', marginBottom: '20px' }}>
        <h3>📊 Archivos subidos esta semana: 0</h3>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '400px' }}>
        <h2>Subir nuevo archivo</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Formatos permitidos: <b>PDF, JPG</b> <br/>
          Tamaño máximo: <b>12 MB</b>
        </p>
        
        <input 
          type="file" 
          accept=".pdf, .jpg, .jpeg" 
          style={{ display: 'block', margin: '15px 0' }} 
        />

        <button style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Subir Archivo
        </button>
      </div>
    </div>
  )
}
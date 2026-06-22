import React, { useEffect, useState } from 'react'
// Estado que almacena los archivos obtenidos desde el backend
function App() {
  const [files, setFiles] = useState([])
  // Estado que guarda el archivo seleccionado por el usuario
  const [selectedFile, setSelectedFile] = useState(null)
  // Estado utilizado para mostrar el proceso de carga
  const [loading, setLoading] = useState(false)
  
  // Ahora el contador semanal viene directamente calculado desde el historial del backend
  const [weeklyFilesCount, setWeeklyFilesCount] = useState(0)
// Obtiene los archivos almacenados y el contador semanal desde la API
  const loadFiles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/files')
      const data = await response.json()
      
      // Separamos los datos devueltos por el nuevo formato del backend
      setFiles(data.activeFiles || [])
      setWeeklyFilesCount(data.weeklyUploadsCount || 0)
    } catch (error) {
      console.error('Error cargando archivos:', error)
    }
  }
// Gestiona el proceso completo de subida de archivos
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Seleccione un archivo')
      return
    }

    if (selectedFile.size > 12 * 1024 * 1024) {
      alert('El archivo supera el tamaño máximo permitido de 12 MB')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://127.0.0.1:8000/api/upload/presigned-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileSize: selectedFile.size
          })
        }
      )

      if (!response.ok) {
        throw new Error('Error obteniendo URL firmada')
      }

      const data = await response.json()

      const uploadResponse = await fetch(
        data.presignedUrl,
        {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type
          }
        }
      )

      if (!uploadResponse.ok) {
        throw new Error('Error subiendo archivo a S3')
      }

      alert('Archivo subido correctamente')
      await loadFiles()
      setSelectedFile(null)

      document.getElementById('file-upload').value = "";

    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (key) => {
    const confirmDelete = window.confirm('¿Está seguro de eliminar este archivo?')

    if (!confirmDelete) {
      return
    }

    try {
      const response = await fetch(
  `http://127.0.0.1:8000/api/files/${encodeURIComponent(key)}`,
  {
    method: 'DELETE'
  }
)

      if (!response.ok) {
        throw new Error('No se pudo eliminar el archivo')
      }

      await loadFiles()
      alert('Archivo eliminado correctamente')

    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }
// Carga los datos iniciales al abrir la aplicación
  useEffect(() => {
    loadFiles()
  }, [])

  return (
    <div
      style={{
        padding: '40px 20px',
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        backgroundColor: '#121212',
        color: '#e0e0e0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <h1
        style={{
          fontSize: '40px',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#ffffff',
          letterSpacing: '-0.5px'
        }}
      >
        ☁️ ArchivaCloud
      </h1>

      {/* Banner Semanal */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)',
          padding: '20px 25px',
          width: '100%',
          maxWidth: '800px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '30px',
          boxShadow: '0 4px 15px rgba(13, 110, 253, 0.2)',
          color: '#ffffff'
        }}
      >
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          📊 Archivos subidos esta semana: {weeklyFilesCount}
        </h2>
      </div>

      {/* Lista de Archivos */}
      <div
        style={{
          border: '1px solid #333',
          padding: '25px',
          width: '100%',
          maxWidth: '800px',
          marginBottom: '25px',
          borderRadius: '12px',
          backgroundColor: '#1e1e1e',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Archivos encontrados</h3>
          <span style={{ backgroundColor: '#333', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
            {files.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>
              <p style={{ margin: 0 }}>No hay archivos almacenados actualmente.</p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  backgroundColor: '#252525',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <span style={{ fontSize: '15px', color: '#ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {file.key.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}
                  </span>
                  {file.key.replace('uploads/', '')}
                </span>

                <button
                  onClick={() => handleDelete(file.key)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = '#ef4444'; e.target.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ef4444'; }}
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zona de Subida */}
      <div
        style={{
          border: '1px solid #333',
          padding: '25px',
          width: '100%',
          maxWidth: '800px',
          borderRadius: '12px',
          backgroundColor: '#1e1e1e',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '18px' }}>Subir nuevo archivo</h3>

        <p style={{ fontSize: '14px', color: '#aaa', margin: '0 0 20px 0' }}>
          Formatos permitidos: <b style={{ color: '#fff' }}>PDF, JPG</b> | Tamaño máximo: <b style={{ color: '#fff' }}>12 MB</b>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{
              flex: '1',
              padding: '10px',
              backgroundColor: '#252525',
              border: '1px dashed #555',
              borderRadius: '8px',
              color: '#ddd',
              cursor: 'pointer'
            }}
          />

          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            style={{
              padding: '12px 24px',
              cursor: (loading || !selectedFile) ? 'not-allowed' : 'pointer',
              backgroundColor: (loading || !selectedFile) ? '#333' : '#22c55e',
              color: (loading || !selectedFile) ? '#888' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              transition: 'background-color 0.2s ease',
              minWidth: '130px'
            }}
          >
            {loading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
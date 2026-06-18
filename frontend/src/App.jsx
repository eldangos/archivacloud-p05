import React, { useEffect, useState } from 'react'

function App() {

  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

const weeklyFilesCount = files.filter((file) => {
  const fileDate = new Date(file.lastModified)
  return fileDate >= oneWeekAgo
}).length

  const loadFiles = async () => {
    try {

      const response = await fetch(
        'http://127.0.0.1:8000/api/files'
      )

      const data = await response.json()

      setFiles(data)

    } catch (error) {
      console.error('Error cargando archivos:', error)
    }
  }

  const handleUpload = async () => {

    if (!selectedFile) {
      alert('Seleccione un archivo')
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

    } catch (error) {

      console.error(error)
      alert(error.message)

    } finally {

      setLoading(false)

    }

  }

  const handleDelete = async (key) => {

  const confirmDelete = window.confirm(
    '¿Está seguro de eliminar este archivo?'
  )

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

  useEffect(() => {
    loadFiles()
  }, [])

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'monospace',
        backgroundColor: '#1e1e1e',
        color: '#fff',
        minHeight: '100vh'
      }}
    >
      <h1>ArchivaCloud - Pareja 05</h1>

      <div
        style={{
          backgroundColor: '#005f73',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px'
        }}
      >
        <h3>Archivos subidos esta semana: {weeklyFilesCount}</h3>
      </div>

      <div
        style={{
          border: '1px solid #555',
          padding: '20px',
          maxWidth: '500px',
          marginBottom: '20px',
          borderRadius: '5px'
        }}
      >
        <p>Archivos encontrados: {files.length}</p>

        <p>----------------------------------------</p>

        {
          files.length === 0 ? (
            <p>No hay archivos almacenados.</p>
          ) : (
            files.map((file) => (
              <div
                key={file.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <span>
                  {
                    file.key.toLowerCase().endsWith('.pdf')
                      ? '📄'
                      : '🖼️'
                  }{' '}
                  {file.key.replace('uploads/', '')}
                </span>

              <button
                onClick={() => handleDelete(file.key)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px'
                }}
              >
                [Eliminar]
              </button>

              </div>
            ))
          )
        }

        <p>----------------------------------------</p>
      </div>

      <div
        style={{
          border: '1px solid #555',
          padding: '20px',
          maxWidth: '500px',
          borderRadius: '5px'
        }}
      >
        <h2>Subir nuevo archivo</h2>

        <p
          style={{
            fontSize: '14px',
            color: '#aaa'
          }}
        >
          Formatos permitidos: <b>PDF, JPG</b> | Tamaño máximo: <b>12 MB</b>
        </p>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{
            display: 'block',
            margin: '15px 0'
          }}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none'
          }}
        >
          {loading ? 'Subiendo...' : '[Subir]'}
        </button>

      </div>

    </div>
  )
}

export default App
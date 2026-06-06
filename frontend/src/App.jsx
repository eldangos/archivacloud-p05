function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f9',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            marginBottom: '10px',
            color: '#2c3e50',
          }}
        >
          ArchivaCloud
        </h1>

        <p
          style={{
            color: '#7f8c8d',
            marginBottom: '30px',
          }}
        >
          Sistema de gestión y almacenamiento de archivos.
        </p>

        <div
          style={{
            backgroundColor: '#eef7ff',
            borderLeft: '5px solid #3498db',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '25px',
          }}
        >
          <strong>📊 Archivos subidos esta semana:</strong> 0
        </div>

        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '25px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: '#34495e',
            }}
          >
            Subir nuevo archivo
          </h2>

          <p
            style={{
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          >
            Formatos permitidos: <strong>PDF, JPG</strong>
            <br />
            Tamaño máximo: <strong>12 MB</strong>
          </p>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            style={{
              marginTop: '15px',
              marginBottom: '20px',
              width: '100%',
            }}
          />

          <button
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            Subir Archivo
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
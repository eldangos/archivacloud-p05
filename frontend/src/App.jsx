import { useEffect, useState } from "react";

function App() {

  const [files, setFiles] = useState([]);

const loadFiles = async () => {
  try {

    const response = await fetch(
      "http://127.0.0.1:8000/api/files"
    );

    const data = await response.json();

    console.log("ARCHIVOS:", data);

    setFiles(data);

  } catch (error) {
    console.error("ERROR:", error);
  }
};

  useEffect(() => {
    loadFiles();
  }, []);

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
        <h1>ArchivaCloud</h1>

        <p>
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
          <strong>
            📊 Archivos encontrados:
          </strong>{" "}
          {files.length}
        </div>

        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '25px'
          }}
        >
          <h2>Archivos almacenados</h2>

          {files.length === 0 ? (
            <p>No hay archivos en el bucket.</p>
          ) : (
            <ul>
              {files.map((file) => (
                <li key={file.key}>
                  {file.key}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '25px',
          }}
        >
          <h2>Subir nuevo archivo</h2>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
          />

          <br />
          <br />

          <button>
            Subir Archivo
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
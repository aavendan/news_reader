import { useState, useEffect } from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonAlert } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { sendToFirebaseByDate, fetchAllSections, sanitizeKeys } from '../services/Loader';
import './Tab1.css';

const sectiones = [
  'Tecnología',
  'Deportes',
  'Política',
  'Entretenimiento',
  'Salud',
  'Educación'
];

const Tab1: React.FC = () => {

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);

  // Función para formatear la fecha en español
  const getFormattedDate = () => {
    const today = new Date();
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();

    return `${day} de ${month} del ${year}`;
  };

  // Detectar cuando las noticias se guardan exitosamente
  useEffect(() => {
    if (status.length > 0 && !status.startsWith("Error")) {
      setShowAlert(true);
    }
  }, [status]);

  const handleLoadAndSave = async () => {
    setLoading(true);
    setStatus("");

    try {
      // 1) obtener todas las respuestas (paralelo)
      const results = await fetchAllSections();
      setData(results);

      const cleanResults = sanitizeKeys(results);

      // 2) armar payload (incluye timestamp)
      const payload = {
        createdAt: new Date().toISOString(),
        source: "eluniverso",
        sections: cleanResults,
      };

      // 3) enviar a Firebase (elige UNA)
      // const fbResp = await sendToFirebase(payload); // POST con key automática
      const fbResp = await sendToFirebaseByDate(payload); // PUT por fecha

      setStatus(`Guardado en Firebase.`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? "desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Descargar Noticias</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Secciones de Noticias</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: '20px' }}>
          <h2 style={{ textAlign: 'center', paddingBottom: '5%' }}>El Universo</h2>

          <IonButton
            onClick={handleLoadAndSave} disabled={loading}
            expand="block" color="primary" style={{ marginBottom: '20px' }}>
            Cargar Noticias
          </IonButton>

          {status.length > 0 && !status.startsWith("Error") && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ccc' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Secciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry) => (
                    <tr key={entry.section} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: '10px', textTransform: 'capitalize' }}>{entry.section}</td>
                    </tr>
                  ))}
                </tbody>
              </table>


              <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header="News reader"
                message={`Noticias guardadas el ${getFormattedDate()}`}
                buttons={['OK']}
              />
            </>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

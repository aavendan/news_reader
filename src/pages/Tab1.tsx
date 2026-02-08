import { useState } from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
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

      setStatus(`Guardado en Firebase. Respuesta: ${JSON.stringify(fbResp)}`);
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
          <IonTitle>Lector de Noticias</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Secciones de Noticias</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: '20px' }}>
          <h2>El Universo</h2>

          <IonButton
            onClick={handleLoadAndSave} disabled={loading}
            expand="block" color="primary" style={{ marginBottom: '20px' }}>
            Cargar Noticias
          </IonButton>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Sección</th>
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

import { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { fetchAvailableDates, fetchSectionsByDate, fetchNewsByDateAndSection } from '../services/Loader';
import './Tab2.css';

const Tab2: React.FC = () => {

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [loadingSections, setLoadingSections] = useState(false);

  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    const loadDates = async () => {
      try {
        const dates = await fetchAvailableDates();
        // Ordenar fechas de más reciente a más antigua
        const sortedDates = dates.sort((a, b) => b.localeCompare(a));
        setAvailableDates(sortedDates);
        // Seleccionar la primera fecha por defecto
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]);
        }
      } catch (error) {
        console.error("Error cargando fechas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDates();
  }, []);

  // Cargar secciones cuando cambie la fecha seleccionada
  useEffect(() => {
    const loadSections = async () => {
      if (!selectedDate) {
        setSections([]);
        setSelectedSection("");
        return;
      }

      setLoadingSections(true);
      try {
        const sectionsData = await fetchSectionsByDate(selectedDate);
        setSections(sectionsData);
        // Seleccionar la primera sección por defecto
        if (sectionsData.length > 0) {
          setSelectedSection(sectionsData[0]);
        }
      } catch (error) {
        console.error("Error cargando secciones:", error);
        setSections([]);
      } finally {
        setLoadingSections(false);
      }
    };

    loadSections();
  }, [selectedDate]);

  // Cargar noticias cuando cambien la fecha o la sección seleccionada
  useEffect(() => {
    const loadNews = async () => {
      if (!selectedDate || !selectedSection) {
        setNews([]);
        return;
      }

      setLoadingNews(true);
      try {
        const newsData = await fetchNewsByDateAndSection(selectedDate, selectedSection);
        setNews(newsData);
      } catch (error) {
        console.error("Error cargando noticias:", error);
        setNews([]);
      } finally {
        setLoadingNews(false);
      }
    };

    loadNews();
  }, [selectedDate, selectedSection]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Leer Noticias</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Noticias por Fecha</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div style={{ padding: '20px' }}>
          <IonItem>
            <IonLabel>Fecha: </IonLabel>
            <IonSelect
              value={selectedDate}
              placeholder="Elige una fecha"
              onIonChange={(e) => setSelectedDate(e.detail.value)}
              disabled={loading || availableDates.length === 0}
            >
              {availableDates.map((date) => (
                <IonSelectOption key={date} value={date}>
                  {date}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {loading && <p style={{ marginTop: '20px', textAlign: 'center' }}>Cargando fechas...</p>}
          {!loading && availableDates.length === 0 && (
            <p style={{ marginTop: '20px', textAlign: 'center' }}>No hay fechas disponibles</p>
          )}

          {!loading && selectedDate && (
            <>
              <IonItem style={{ marginTop: '20px' }}>
                <IonLabel>Sección: </IonLabel>
                <IonSelect
                  value={selectedSection}
                  placeholder="Elige una sección"
                  onIonChange={(e) => setSelectedSection(e.detail.value)}
                  disabled={loadingSections || sections.length === 0}
                >
                  {sections.map((section, index) => (
                    <IonSelectOption key={index} value={section}>
                      {section}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {loadingSections && (
                <p style={{ marginTop: '20px', textAlign: 'center' }}>Cargando secciones...</p>
              )}
              {!loadingSections && sections.length === 0 && (
                <p style={{ marginTop: '20px', textAlign: 'center' }}>No hay secciones disponibles</p>
              )}
              {!loadingSections && selectedSection && (
                <>
                  {loadingNews && (
                    <p style={{ marginTop: '20px', textAlign: 'center' }}>Cargando noticias...</p>
                  )}
                  {!loadingNews && news.length === 0 && (
                    <p style={{ marginTop: '20px', textAlign: 'center' }}>No hay noticias disponibles</p>
                  )}
                  {!loadingNews && news.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      {/* <h3>Noticias: {news.length} items</h3> */}
                      {news.map((item, index) => (
                        <div key={index} style={{ 
                          padding: '15px', 
                          marginBottom: '10px', 
                          border: '1px solid #ccc', 
                          borderRadius: '8px' 
                        }}>
                          <h6 style={{ marginTop: 0 }}>{item.title || 'Sin título'}</h6>
                          {/* {item.description && (
                            <p style={{ fontSize: '14px', color: '#666' }}>
                              {item.description}
                            </p>
                          )} */}
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" 
                               style={{ fontSize: '13px', color: '#007bff' }}>
                              Leer más →
                            </a>
                          )}
                          {/* {item.pubDate && (
                            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                              {item.pubDate}
                            </p>
                          )} */}
                        </div>
                      ))}
                    </div>
                  )}
                </>



              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;

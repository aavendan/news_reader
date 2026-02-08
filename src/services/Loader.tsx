import { XMLParser } from "fast-xml-parser";

const BASE_URL =
    "https://www.eluniverso.com/arc/outboundfeeds/rss-subsection/{section}/?outputType=xml";

const SECTIONS = [
    "guayaquil/comunidad",
    "noticias/ecuador",
    "noticias/internacional",
    "noticias/politica",
    "deportes/futbol",
    "noticias/economia",
];


const FIREBASE_BASE = "https://news-reader-2acd6-default-rtdb.firebaseio.com";
const FIREBASE_PATH = "eluniverso"; // terminará en .../eluniverso.json

function xmlToJson(xmlText: string) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseTagValue: true,
        trimValues: true,
    });
    return parser.parse(xmlText);
}

function buildUrl(section: string) {
    return BASE_URL.replace("{section}", encodeURIComponent(section));
}

async function fetchSectionAsJson(section: string) {
    const url = buildUrl(section);
    const res = await fetch(url, {
        headers: { Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `Error ${res.status} en section="${section}". Body: ${body.slice(0, 200)}`
        );
    }

    const xmlText = await res.text();
    const json = xmlToJson(xmlText);
    return { section, url, json };
}

function sanitizeKeys(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(sanitizeKeys);
    }

    if (obj !== null && typeof obj === "object") {
        const cleanObj: any = {};
        for (const key of Object.keys(obj)) {
            const cleanKey = key.replace(/[.$#[\]/]/g, "_");
            cleanObj[cleanKey] = sanitizeKeys(obj[key]);
        }
        return cleanObj;
    }

    return obj;
}


async function fetchAllSections() {
    const results = await Promise.all(SECTIONS.map(fetchSectionAsJson));
    return results; // [{section,url,json}, ...]
}

// ✅ Variante opcional: guardar por fecha (sobrescribe ese día)
// PUT a .../eluniverso/2026-02-07.json
function todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

async function sendToFirebaseByDate(payload: any) {
    const key = todayKey();
    const endpoint = `${FIREBASE_BASE}/${FIREBASE_PATH}/${key}.json`;

    const res = await fetch(endpoint, {
        method: "PUT", // PUT para escribir exactamente en esa fecha
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `Firebase error ${res.status} (${res.statusText}). Body: ${body.slice(
                0,
                200
            )}`
        );
    }

    return res.json();
}

// Función para leer todas las fechas disponibles en Firebase
async function fetchAvailableDates() {
    const endpoint = `${FIREBASE_BASE}/${FIREBASE_PATH}.json`;

    const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `Firebase error ${res.status} (${res.statusText}). Body: ${body.slice(
                0,
                200
            )}`
        );
    }

    const data = await res.json();

    // Si data es null o no es un objeto, devolver array vacío
    if (!data || typeof data !== "object") {
        return [];
    }

    // Devolver las claves (fechas en formato yyyy-mm-dd)
    return Object.keys(data);
}

// Función para obtener las secciones de una fecha específica
async function fetchSectionsByDate(fecha: string) {
    const endpoint = `${FIREBASE_BASE}/${FIREBASE_PATH}/${fecha}.json`;

    const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `Firebase error ${res.status} (${res.statusText}). Body: ${body.slice(
                0,
                200
            )}`
        );
    }

    const data = await res.json();

    // Si data es null o no tiene sections, devolver array vacío
    if (!data || !data.sections || !Array.isArray(data.sections)) {
        return [];
    }

    // Devolver los elementos del arreglo sections con su clave section
    return data.sections.map((item: any) => item.section);
}

// Función para obtener los items de una sección específica por fecha
async function fetchNewsByDateAndSection(fecha: string, seccion: string) {
    const endpoint = `${FIREBASE_BASE}/${FIREBASE_PATH}/${fecha}.json`;

    const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `Firebase error ${res.status} (${res.statusText}). Body: ${body.slice(
                0,
                200
            )}`
        );
    }

    const data = await res.json();

    // Validar que existan los datos necesarios
    if (!data || !data.sections || !Array.isArray(data.sections)) {
        return [];
    }

    // Buscar la sección en el arreglo
    const sectionData = data.sections.find((item: any) => item.section === seccion);

    if (!sectionData) {
        return [];
    }

    // Navegar a json.rss.channel.item
    const items = sectionData?.json?.rss?.channel?.item;

    if (!items) {
        return [];
    }

    // Si item es un solo objeto, convertirlo en array
    return Array.isArray(items) ? items : [items];
}



export { sendToFirebaseByDate, fetchAllSections, sanitizeKeys, fetchAvailableDates, fetchSectionsByDate, fetchNewsByDateAndSection };
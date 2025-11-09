# TODO - Prossima Sessione

## ✅ Completato Oggi
- [x] Sistema di estrazione PDF con pdf-parse
- [x] LLM locale (Qwen 2.5 7B) configurato e operativo
- [x] API routes: `/api/preventivi/upload` e `/api/preventivi/parse`
- [x] Database: Tabella Preventivo creata su Supabase
- [x] ProcessingScreen moderna per elaborazione PDF
- [x] ExtractedDataView per visualizzare dati estratti
- [x] Fix LoadingScreen (ora usato solo ProcessingScreen)

---

## 🎯 Da Completare Domani

### 1. Sezione "Preventivi" nella Sidebar

**Cosa fare:**
- Aggiungere sezione "PREVENTIVI" sopra "DOCUMENTI RECENTI"
- Mostrare lista preventivi caricati (fetch da database)
- Ogni preventivo mostra:
  - Nome file
  - Data caricamento
  - Status (Estratto / Parsato / Errore)
  - Importo totale (se disponibile)

**File da modificare:**
- `app/dashboard/page.tsx` (sidebar, linee 228-303)

---

### 2. Viewer PDF + Dati Estratti

**Cosa fare:**
Creare componente `PreventivioViewer.tsx` che mostra:

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [← Indietro]                    [Genera]   │
├──────────────────────┬──────────────────────┤
│                      │                      │
│   PDF VIEWER         │   DATI ESTRATTI      │
│   (iframe/embed)     │   (ExtractedData)    │
│                      │                      │
│   - Zoom in/out      │   - Importi          │
│   - Scroll           │   - Fornitore        │
│   - Download         │   - Descrizione      │
│                      │   - Date             │
│                      │                      │
│                      │   [Modifica Dati]    │
└──────────────────────┴──────────────────────┘
```

**File da creare:**
- `app/components/PreventivoViewer.tsx`

**Props:**
```typescript
interface PreventivoViewerProps {
  preventivoId: string;
  pdfUrl: string;
  extractedData: ExtractedData;
  onBack: () => void;
  onGenerate: () => void;
}
```

---

### 3. Integrare API Reali nella Dashboard

**File da modificare:**
- `app/dashboard/page.tsx`

**Modifiche necessarie:**

#### A) Upload PDF (sostituire mock)
Attualmente linea 47-49:
```typescript
const handleGenerate = () => {
  setIsGenerating(true);
};
```

**Cambiare in:**
```typescript
const handleUpload = async () => {
  if (!selectedFile) return;

  setIsUploading(true);

  try {
    // 1. Upload PDF
    const formData = new FormData();
    formData.append("file", selectedFile);

    const uploadRes = await fetch("/api/preventivi/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) throw new Error("Upload fallito");

    const uploadData = await uploadRes.json();
    const preventivoId = uploadData.preventivo.id;

    // 2. Parse con LLM
    const parseRes = await fetch("/api/preventivi/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preventivoId }),
    });

    if (!parseRes.ok) throw new Error("Parsing fallito");

    const parseData = await parseRes.json();

    // 3. Mostra dati estratti
    setExtractedData(parseData.preventivo.extractedData);
    setCurrentPreventivoId(preventivoId);
    setShowExtractedData(true);

  } catch (error) {
    console.error(error);
    alert("Errore durante l'elaborazione del preventivo");
  } finally {
    setIsUploading(false);
  }
};
```

#### B) Stati da aggiungere
```typescript
const [isUploading, setIsUploading] = useState(false);
const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
const [currentPreventivoId, setCurrentPreventivoId] = useState<string | null>(null);
const [showExtractedData, setShowExtractedData] = useState(false);
const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
```

#### C) Fetch preventivi all'avvio
```typescript
useEffect(() => {
  const fetchPreventivi = async () => {
    try {
      const res = await fetch("/api/preventivi/list");
      const data = await res.json();
      setPreventivi(data.preventivi);
    } catch (error) {
      console.error("Errore fetch preventivi:", error);
    }
  };

  if (session) {
    fetchPreventivi();
  }
}, [session]);
```

---

### 4. API Route Mancante

**Creare:** `app/api/preventivi/list/route.ts`

Ritorna lista preventivi dell'utente loggato:
```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const preventivi = await prisma.preventivo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      status: true,
      extractedData: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ preventivi });
}
```

---

### 5. Servire File PDF Caricati

**Creare:** `app/api/preventivi/[id]/file/route.ts`

Per scaricare/visualizzare il PDF:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const preventivo = await prisma.preventivo.findUnique({
    where: { id: params.id },
  });

  if (!preventivo) {
    return NextResponse.json({ error: "Preventivo non trovato" }, { status: 404 });
  }

  // Leggi file da uploads/
  const filePath = join(process.cwd(), "uploads", preventivo.filePath);
  const fileBuffer = await readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${preventivo.fileName}"`,
    },
  });
}
```

---

## 🎨 UI Flow Completo (Da Implementare)

```
1. Login con magic link
   ↓
2. Dashboard con sidebar:
   - Preventivi (vuoto se primo accesso)
   - Documenti recenti
   ↓
3. Upload PDF
   ↓
4. ProcessingScreen (10-15 sec)
   ↓
5. ExtractedDataView
   - Mostra dati estratti
   - Bottone "Conferma e Genera"
   ↓
6. Click su preventivo nella sidebar
   ↓
7. PreventivoViewer (PDF + Dati laterali)
   - Bottone "Genera Documenti"
   ↓
8. Selezione documenti da generare
   ↓
9. LoadingScreen generazione
   ↓
10. DocumentViewer con documenti generati
```

---

## 🧪 Test da Fare

1. **Upload PDF reale** e verificare estrazione testo
2. **Parsing con Qwen** e verificare dati estratti
3. **Visualizzazione dati** in ExtractedDataView
4. **Navigazione** tra preventivi nella sidebar
5. **Viewer PDF** con dati laterali
6. **Generazione documenti** dal preventivo

---

## 📝 Note Importanti

- Ollama deve essere in esecuzione (`ollama serve`)
- Server Next.js su `http://localhost:3000`
- Database Supabase connesso via pooler (porta 6543)
- I PDF vengono salvati in `/uploads` (già gitignored)

---

## 🎯 Priorità

1. **Alta**: Integrare API reali (upload + parse + list)
2. **Media**: Creare PreventivoViewer
3. **Media**: Aggiungere sezione Preventivi sidebar
4. **Bassa**: Funzione "Modifica Dati" manuale

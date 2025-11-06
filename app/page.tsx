import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icona.png"
                alt="Logo Generatore Affidamenti"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-semibold text-foreground">Generatore Affidamenti</span>
            </div>
            <div>
              <a href="/login" className="px-4 py-2 bg-gold hover:bg-gold-dark transition-colors rounded-lg text-background font-medium text-sm inline-block">
                Accedi
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full">
              <span className="text-gold text-sm font-medium">Strumento interno</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              <span className="text-gold">Nuovo</span> generatore<br />di affidamenti
            </h1>
            <p className="text-xl md:text-2xl text-foreground/60 mb-12 max-w-3xl">
              Sistema automatizzato per la generazione di documenti amministrativi.
            </p>
            <div>
              <a href="/login" className="inline-block px-10 py-5 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-semibold text-xl shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30">
                Inizia
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-border/50">
              <div>
                <div className="text-3xl font-bold text-gold mb-2">3</div>
                <div className="text-foreground/60 text-sm">Tipi di documenti</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-2">100%</div>
                <div className="text-foreground/60 text-sm">Automatizzato</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-2">0</div>
                <div className="text-foreground/60 text-sm">Errori manuali</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="generator" className="py-20">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Cosa puoi generare
              </h2>
              <p className="text-foreground/60 text-lg">Documenti disponibili nel sistema</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <div className="bg-card-bg border border-border rounded-xl p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Affidamento</h3>
                <p className="text-foreground/60 text-sm">
                  Documento di affidamento completo da preventivo
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-card-bg border border-border rounded-xl p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Proposta d'Affidamento</h3>
                <p className="text-foreground/60 text-sm">
                  Proposta dettagliata per approvazione
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-card-bg border border-border rounded-xl p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Determina</h3>
                <p className="text-foreground/60 text-sm">
                  Determina in base all'importo
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="workflow" className="py-20 mb-20">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Come funziona
              </h2>
              <p className="text-foreground/60 text-lg">Workflow di generazione documenti</p>
            </div>

            <div className="relative">
              {/* Connection line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-gold via-gold/50 to-transparent hidden md:block"></div>

              <div className="space-y-8">
                <div className="flex gap-6 items-start relative">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold rounded-lg flex items-center justify-center text-background font-bold text-lg shadow-lg shadow-gold/30 relative z-10">
                    1
                  </div>
                  <div className="flex-1 bg-card-bg border border-border/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Carica preventivo</h3>
                    <p className="text-foreground/60 text-sm">
                      Importa i dati dal preventivo esistente o inserisci manualmente le informazioni necessarie
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start relative">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold rounded-lg flex items-center justify-center text-background font-bold text-lg shadow-lg shadow-gold/30 relative z-10">
                    2
                  </div>
                  <div className="flex-1 bg-card-bg border border-border/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Seleziona documento</h3>
                    <p className="text-foreground/60 text-sm">
                      Scegli il tipo di documento da generare: affidamento, proposta o determina
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start relative">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold rounded-lg flex items-center justify-center text-background font-bold text-lg shadow-lg shadow-gold/30 relative z-10">
                    3
                  </div>
                  <div className="flex-1 bg-card-bg border border-border/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Genera e scarica</h3>
                    <p className="text-foreground/60 text-sm">
                      Il sistema elabora i dati e genera automaticamente il documento finale
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/icona.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg opacity-80"
              />
              <span className="text-foreground/60 text-sm">Generatore Affidamenti</span>
            </div>
            <div className="text-foreground/40 text-sm">
              Sistema interno di gestione documentale
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

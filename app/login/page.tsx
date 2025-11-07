"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Verifica se siamo tornati dalla verifica email
  const verificaInviata = searchParams.get("verificaInviata");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Email non autorizzata o errore durante l'invio. Controlla che la tua email aziendale sia stata abilitata.");
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Se l'email è stata inviata con successo, mostra un messaggio di conferma
  if (emailSent || verificaInviata) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <Image
                src="/icona.png"
                alt="Logo Generatore Affidamenti"
                width={64}
                height={64}
                className="rounded-xl"
              />
            </div>
            <div className="bg-card-bg border border-gold/30 rounded-2xl p-8 shadow-2xl shadow-black/20">
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Controlla la tua email
              </h2>
              <p className="text-foreground/70 mb-6">
                Ti abbiamo inviato un link di accesso magico a <strong className="text-gold">{email || "la tua email"}</strong>
              </p>
              <p className="text-sm text-foreground/60">
                Il link è valido per 24 ore. Non hai ricevuto l'email? Controlla la cartella spam.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="mt-6 text-gold hover:text-gold-light transition-colors text-sm font-medium"
              >
                ← Usa un'altra email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/icona.png"
              alt="Logo Generatore Affidamenti"
              width={64}
              height={64}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Benvenuto
          </h1>
          <p className="text-foreground/60">
            Accedi con la tua email aziendale
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card-bg border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                Email aziendale
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@tuaazienda.com"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Info box */}
            <div className="bg-background/50 border border-border/50 rounded-lg p-4">
              <p className="text-xs text-foreground/60">
                <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Ti invieremo un link di accesso via email. Nessuna password necessaria.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full px-6 py-4 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-semibold text-lg shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Invio in corso..." : "Invia link di accesso"}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <a href="/" className="text-foreground/60 hover:text-gold transition-colors text-sm">
            ← Torna alla home
          </a>
        </div>
      </div>
    </div>
  );
}

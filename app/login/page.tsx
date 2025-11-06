"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Qui andrà la logica di autenticazione
    // Per ora redirect diretto alla dashboard
    router.push("/dashboard");
  };

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
            Accedi al generatore di affidamenti
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card-bg border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              />
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-background text-gold focus:ring-2 focus:ring-gold/50 cursor-pointer"
                />
                <span className="text-foreground/70">Ricordami</span>
              </label>
              <a href="#" className="text-gold hover:text-gold-light transition-colors">
                Password dimenticata?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-4 bg-gold hover:bg-gold-dark transition-all rounded-lg text-background font-semibold text-lg shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30"
            >
              Accedi
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

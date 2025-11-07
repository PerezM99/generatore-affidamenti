import { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Funzione per verificare se l'email appartiene a un dominio autorizzato
function isEmailAllowed(email: string): boolean {
  const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',').map(d => d.trim()) || []
  const emailDomain = email.split('@')[1]?.toLowerCase()

  if (!emailDomain) return false

  return allowedDomains.some(domain => {
    const normalizedDomain = domain.toLowerCase()
    return emailDomain === normalizedDomain
  })
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      server: "", // Non usato con Resend
      from: process.env.EMAIL_FROM || "noreply@example.com",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        // Verifica se l'email è autorizzata PRIMA di inviare il magic link
        if (!isEmailAllowed(email)) {
          throw new Error("Email non autorizzata. Questo servizio è riservato agli utenti aziendali.")
        }

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "noreply@example.com",
            to: email,
            subject: "Accedi a Generatore Affidamenti",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #0a1410 0%, #0f1b14 100%); padding: 30px; border-radius: 12px; text-align: center;">
                    <h1 style="color: #22c55e; margin: 0 0 20px 0;">Generatore Affidamenti</h1>
                    <p style="color: #e8f5f0; font-size: 16px; margin: 0 0 30px 0;">
                      Clicca il pulsante qui sotto per accedere alla piattaforma.
                    </p>
                    <a href="${url}"
                       style="display: inline-block; background-color: #22c55e; color: #0a1410; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Accedi Ora
                    </a>
                    <p style="color: #94a3b8; font-size: 14px; margin: 30px 0 0 0;">
                      Questo link è valido per 24 ore. Se non hai richiesto questo accesso, ignora questa email.
                    </p>
                  </div>
                </body>
              </html>
            `,
          })
        } catch (error) {
          console.error("Errore invio email:", error)
          throw new Error("Impossibile inviare l'email di verifica.")
        }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 giorni (1 mese)
    updateAge: 24 * 60 * 60, // Aggiorna la sessione ogni 24 ore
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verificaInviata=true",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      // Doppio controllo: verifica che l'email sia autorizzata anche durante il sign-in
      if (!user.email || !isEmailAllowed(user.email)) {
        return false
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}

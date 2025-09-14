import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { BASE_API_URL } from "../global"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        })
    ],
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    // Send user data to backend
                    const response = await fetch(`${BASE_API_URL}/user/google-auth`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            googleId: user.id,
                            picture: user.image,
                        }),
                    })

                    const data = await response.json()
                    
                    if (data.status) {
                        // Store token in user object to be accessible in session
                        user.token = data.token
                        user.userId = data.data.id
                        user.role = data.data.role
                        return true
                    }
                    return false
                } catch (error) {
                    console.error('Error during Google sign in:', error)
                    return false
                }
            }
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.token
                token.userId = user.userId
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            session.userId = token.userId as string
            session.userRole = token.role as string
            return session
        }
    },
}
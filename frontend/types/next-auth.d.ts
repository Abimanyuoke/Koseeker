import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
        accessToken?: string
        userId?: string
        userRole?: string
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
        token?: string
        userId?: string
        role?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        userId?: string
        role?: string
        profilePicture?: string
    }
}
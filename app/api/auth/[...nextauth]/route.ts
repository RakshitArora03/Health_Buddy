import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.userType) {
          throw new Error("Missing fields")
        }

        const { db } = await connectToDatabase()
        const collection = credentials.userType === "patient" ? db.collection("patients") : db.collection("doctors")
        const user = await collection.findOne({ email: credentials.email })

        if (!user) {
          throw new Error("No user found")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          userType: credentials.userType,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType
        token.name = user.name
        token.id = user.id // Add user ID to token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.userType = token.userType as string
        session.user.name = token.name as string
        session.user.id = token.id as string // Add user ID to session
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


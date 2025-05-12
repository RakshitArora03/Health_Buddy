import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // For credential provider, we've already checked in authorize
      if (account?.provider === "credentials") {
        return true
      }

      // For Google provider
      if (account?.provider === "google") {
        try {
          const { db } = await connectToDatabase()

          // Get userType from the state parameter
          const userType = account.state ? JSON.parse(decodeURIComponent(account.state)).userType : "patient"

          // Check if user exists in the appropriate collection
          const collection = userType === "patient" ? db.collection("patients") : db.collection("doctors")
          const existingUser = await collection.findOne({ email: user.email })

          if (existingUser) {
            // User exists, update the user with Google info if needed
            user.id = existingUser._id.toString()
            user.userType = userType
            return true
          } else {
            // Create a new user
            const result = await collection.insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              userType: userType,
              createdAt: new Date(),
            })

            user.id = result.insertedId.toString()
            user.userType = userType
            return true
          }
        } catch (error) {
          console.error("Error during Google sign in:", error)
          return false
        }
      }

      return false
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userType =
          user.userType || (account?.state ? JSON.parse(decodeURIComponent(account.state)).userType : "patient")
        token.name = user.name
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.userType = token.userType as string
        session.user.name = token.name as string
        session.user.id = token.id as string
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


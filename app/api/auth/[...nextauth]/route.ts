import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { CustomMongoDBAdapter } from "@/lib/auth/customMongoDBAdapter"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import Doctor from "@/models/Doctor"
import Patient from "@/models/Patient"

export const authOptions = {
  adapter: CustomMongoDBAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          userType: profile.userType, // This will be set in the callback
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        try {
          await dbConnect()

          if (!credentials?.email || !credentials?.password || !credentials?.userType) {
            throw new Error("Missing credentials")
          }

          const Model = credentials.userType === "doctor" ? Doctor : Patient
          const user = await Model.findOne({ email: credentials.email })

          if (!user) {
            throw new Error("No user found")
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordCorrect) {
            throw new Error("Invalid password")
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            userType: credentials.userType,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      try {
        await dbConnect()

        if (account?.provider === "google") {
          const userType = (profile as any).userType || credentials?.userType
          if (!userType) {
            return false
          }

          const Model = userType === "doctor" ? Doctor : Patient
          const existingUser = await Model.findOne({ email: user.email })

          if (!existingUser) {
            const newUser = new Model({
              name: user.name,
              email: user.email,
              ...(userType === "doctor" ? { specialization: "", licenseNumber: "" } : { healthIdRegistered: false }),
            })
            await newUser.save()
          }
        }
        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).userType = token.userType
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


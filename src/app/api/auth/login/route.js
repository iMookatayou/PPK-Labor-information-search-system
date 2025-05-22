import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        }).then(res => res.json());

        if (user && user.id) {
          return user;
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  }
});

export { handler as GET, handler as POST };

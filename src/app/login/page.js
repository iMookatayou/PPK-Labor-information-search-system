"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login success");
    } else {
      alert("Login failed");
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}

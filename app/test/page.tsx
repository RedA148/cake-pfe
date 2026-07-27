"use client";

import { createClient } from "@/lib/client";

const supabase = createClient();

export default function Test() {
  const loginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });

    console.log(error);
  };

  return (
    <button
      onClick={loginGoogle}
      className="bg-red-500 text-white p-4 rounded"
    >
      Login Google
    </button>
  );
}
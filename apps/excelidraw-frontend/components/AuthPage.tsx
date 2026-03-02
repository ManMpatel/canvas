// "use client";

// export function AuthPage({isSignin}: {
//     isSignin: boolean
// }) {
//     return <div className="w-screen h-screen flex justify-center items-center">
//         <div className="p-6 m-2 bg-white rounded">
//             <div className="p-2">
//                 <input type="text" placeholder="Email"></input>
//             </div>
//             <div className="p-2">
                
//             </div>

//             <div className="pt-2">
//                 <button className="bg-red-200 rounded p-2" onClick={() => {

//                 }}>{isSignin ? "Sign in" : "Sign up"}</button>
//             </div>
//         </div>
//     </div>

// }



"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);

      const url = isSignin
        ? "http://localhost:3008/signin"
        : "http://localhost:3008/signup";

      const payload = isSignin
        ? {
            username,
            password,
          }
        : {
            username,
            password,
            name,
          };

      const res = await axios.post(url, payload);

      if (isSignin) {
        localStorage.setItem("token", res.data.token);
        router.push("/");
        console.log(res.data);
      } else {
        alert("Signup successful 🎉 Please sign in");
        router.push("/signin");
      }

    } catch (err) {
      alert("Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-[400px]">

        <h1 className="text-3xl font-bold text-center mb-2">
          {isSignin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h1>

        <p className="text-gray-500 text-center mb-8">
          {isSignin
            ? "Sign in to continue drawing"
            : "Join and start collaborating"}
        </p>

        {/* Name (Only for Signup) */}
        {!isSignin && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* Username (Email) */}
        <input
          type="text"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
        >
          {loading
            ? "Please wait..."
            : isSignin
            ? "Sign In"
            : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="text-blue-600 cursor-pointer ml-2"
            onClick={() =>
              router.push(isSignin ? "/signup" : "/signin")
            }
          >
            {isSignin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
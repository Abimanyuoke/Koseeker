"use client"

import { BASE_API_URL } from "../../../global";
import { storeCookie } from "@/lib/client-cookies";
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react";
import { HiEyeSlash } from "react-icons/hi2";
import { IoEyeSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import imgLogin from "../../../public/images/kosimage.jpeg";
import logo from "../../../public/images/logo.svg";
import siluet from "../../../public/images/siluetKota.png";
import { signIn } from "next-auth/react";


export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoading(true)
            const url = `${BASE_API_URL}/user/login`
            const payload = JSON.stringify({ email: email, password })
            const { data } = await axios.post<{
                status: boolean; message: string; token: string; data?: {
                    alamat: string; id: string; name: string; role: string; profile_picture?: string
                }
            }>(url, payload, { headers: { "Content-Type": "application/json" } })
            if (data.status == true) {
                toast.success("Login success", { duration: 2000 })
                // Simpan di localStorage untuk client-side access
                localStorage.setItem("token", data.token)
                // Simpan di cookies untuk server-side middleware
                storeCookie("token", data.token)
                if (data.data) {
                    localStorage.setItem("id", data.data.id)
                    localStorage.setItem("name", data.data.name)
                    localStorage.setItem("role", data.data.role)
                    localStorage.setItem("profile_picture", data.data.profile_picture || "")

                    storeCookie("id", data.data.id)
                    storeCookie("name", data.data.name)
                    storeCookie("role", data.data.role)
                    storeCookie("profile_picture", data.data.profile_picture || "")

                    let role = data.data.role
                    if (role === `owner`) {
                        setTimeout(() => router.replace(`/manager`), 1000)
                    } else if (role === `society`) {
                        setTimeout(() => router.replace(`/home`), 1000)
                    }
                }
            }
            else toast.warning(data.message, { duration: 2000 })
        } catch (error) {
            console.log(error);
            toast.error(`Something wrong`, { duration: 2000 })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true)
            // Use callbackUrl to redirect after successful login
            await signIn("google", {
                callbackUrl: "/auth/callback"
            })
        } catch (error) {
            console.error("Google sign in error:", error)
            toast.error("Failed to sign in with Google", { duration: 2000 })
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen bg-green-50 w-full relative overflow-hidden font-poppins">
            <div className="w-full h-full flex justify-center items-center relative">
                <div className="flex">
                    <div className="relative">
                        <Image src={imgLogin} alt="Image Login" width={680} height={600} className="h-[605px] rounded-l-lg" />
                        <div className="absolute w-full">
                            <span className="absolute bottom-0 w-full h-[300px] bg-gradient-to-t opacity-30 from-black via-black to-transparent">{""}</span>
                            <div className="absolute bottom-0 text-white space-y-2 p-4">
                                <h4 className="text-5xl font-semibold leading-[58px]">
                                    Capture Your <br /> Journeys
                                </h4>
                                <p className="text-[15px] text-white leading-6 pr-7 mt-4">Koseeker ready to help you capture moments that matter.</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-3/5 px-10 py-20 bg-white rounded-r-lg relative shadow">
                        <div className="flex flex-col items-center justify-center mb-4">
                            <Image src={logo} alt="Logo" width={60} height={60} className="w-16 h-16 object-cover" />
                            <h1 className="text-2xl font-semibold ">
                                Hello ! Welcome back
                            </h1>
                        </div>
                        <form className="flex flex-col pt-5 gap-3" onSubmit={handleSubmit}>
                            <div className="flex w-full items-center rounded relative">
                                <input type="email" placeholder="Email" className="w-full pl-4 pr-4 py-2.5 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary transition-all duration-300 text-gray-700 placeholder:text-gray-400" value={email}
                                    onChange={e => setEmail(e.target.value)} id={`email`} />
                            </div>

                            <div className="flex w-full items-center rounded relative">
                                <input type={showPassword ? `text` : `password`} className="w-full pl-4 pr-4 py-2.5 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary transition-all duration-300 text-gray-700 placeholder:text-gray-400" value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="Password" id={`password`} />
                                <div className="cursor-pointer rounded-r-md p-3 absolute right-0" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ?
                                        <IoEyeSharp className="text-[#8390A2] text-lg" /> :
                                        <HiEyeSlash className="text-[#8390A2] text-lg" />
                                    }
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading || !email || !password} className={`mt-3 uppercase text-sm font-semibold bg-gradient-to-r from-primary/80 to-green-800 shadow-lg p-[10px] hover:text-white duration-200 transition-all hover:scale-105 text-white py-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${email && password ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                {isLoading ? "Logging in..." : "login"}
                            </button>
                            <div className="flex flex-col justify-center text-center">
                                <button type="button" onClick={() => { router.push("/auth/signup") }} className="uppercase text-sm text-primary border border-primary hover:scale-105 rounded-full py-2 cursor-pointer font-semibold duration-300 transition-all">create account</button>
                            </div>
                            <p className="text-xs text-center text-slate-500 my-2">Or</p>
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-full font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <FcGoogle className="text-lg" />
                                {isLoading ? "Signing in..." : "Continue with Google"}
                            </button>

                        </form>
                        <Image src={siluet} alt="Logo" width={300} height={60} className=" object-cover absolute bottom-0 right-0 z-10" />
                    </div>
                </div>
            </div>
        </div>
    )
}


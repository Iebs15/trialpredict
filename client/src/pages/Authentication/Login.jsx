import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { saveUserData } from '@/lib/db';

function Login({ onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');  // Clear any previous error
        try {
            // Send a POST request to the backend
            console.log(import.meta.env.VITE_API_URL)
            const response = await fetch(`${import.meta.env.VITE_API_URL}:6001/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Login done !!!");
                console.log(data);
                setError('');  // Clear error
                // setSuccessMessage("Sign in successful.");
                // setErrorMessage("");
                await saveUserData({
                    user_salescout_id: data.uuid,
                    user_salescout_email_id: data.email,
                    first_name_salescout_user: data.first_name,
                    last_name_salescout_user: data.last_name,
                    company_salescout_user: data.company,
                    user_email_info: data.email_info,
                    user_designation: data.designation,
                    user_about: data.about_user
                });
                navigate('/dashboard');
                // Redirect or handle successful login
            } else {
                setError(data.message || "Login failed");
            }

        } catch (error) {
            console.log(error);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className='flex flex-col mt-[-50px] rounded-[30px] bg-white w-[400px] h-[480px] shadow-2xl z-10 justify-center '>
            <h1 className="font-poppins text-2xl font-medium leading-12 text-center">Log in</h1>
            <p className='font-poppins text-base font-normal leading-6 text-center text-[#666666]'>
                Don't have an account?{' '}
                <span className="underline cursor-pointer" onClick={onSwitchToSignup}>Sign up</span>
            </p>

            <form onSubmit={handleLogin} className="flex flex-col px-8 items-start mt-8 gap-1.5">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                
                <Label htmlFor="email" className='text-left text-[#666666]'>Your email</Label>
                <Input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                />
                
                <Label htmlFor="password" className='text-left text-[#666666]'>Your password</Label>
                <Input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                />

                <Button type="submit" className='w-full bg-[#95D524] rounded-[27px] mt-4 px-8 text-black hover:bg-[#95b833]'>
                    Login
                </Button>
            </form>
        </div>
    );
}

export default Login;

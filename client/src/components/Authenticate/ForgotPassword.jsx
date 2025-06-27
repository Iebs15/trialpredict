import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password reset link sent to your email!');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Something went wrong.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className='flex flex-col mt-[-50px] rounded-[30px] bg-white w-[400px] h-[400px] shadow-custom z-10 justify-center'>
            <h1 className="font-poppins text-2xl font-medium leading-12 text-center">Forgot Password</h1>
            <form onSubmit={handleForgotPassword} className="flex flex-col px-8 items-start mt-6 gap-1.5">
                {error && <p className="text-red-500">{error}</p>}
                {message && <p className="text-green-500">{message}</p>}

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
                <Button type="submit" className='w-full bg-[#95D524] rounded-[27px] mt-4 px-8 text-black hover:bg-[#95b833]'>
                    Send Reset Link
                </Button>
            </form>
        </div>
    );
}

export default ForgotPassword;

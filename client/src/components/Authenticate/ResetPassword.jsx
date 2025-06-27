import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';

function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // You could add token verification here as well
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password has been reset successfully!');
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
            <h1 className="font-poppins text-2xl font-medium leading-12 text-center">Reset Password</h1>
            <form onSubmit={handleSubmit} className="flex flex-col px-8 items-start mt-6 gap-1.5">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}

                <Label htmlFor="password" className='text-left text-[#666666]'>New Password</Label>
                <Input
                    type="password"
                    id="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                />

                <Label htmlFor="confirmPassword" className='text-left text-[#666666]'>Confirm Password</Label>
                <Input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                />

                <Button type="submit" className='w-full bg-[#95D524] rounded-[27px] mt-4 px-8 text-black hover:bg-[#95b833]'>
                    Reset Password
                </Button>
            </form>
        </div>
    );
}

export default ResetPassword;

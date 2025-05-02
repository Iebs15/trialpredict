import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { saveUserData } from '@/lib/db';

function Signup({ onSwitchToLogin }) {
    const [firstName, setFirstName] = useState('');
    const [designation, setdesignation] = useState('');
    const [company, setCompany] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}:6001/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    designation,
                    company,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Account created successfully!");
                setError('');

                await saveUserData({
                    user_salescout_id: data.uuid,
                    user_salescout_email_id: data.email,
                    first_name_salescout_user: data.first_name,
                    last_name_salescout_user: data.last_name,
                    company_salescout_user: data.company,
                });

                navigate('/dashboard');
            } else {
                setError(data.message || "Signup failed");
            }

        } catch (error) {
            setError("An error occurred. Please try again.");
        }
    };


    return (
        <div className='flex flex-col mt-[-90px] rounded-[30px] bg-white w-[400px] h-[600px] shadow-custom z-10 justify-center'>
            <h1 className="font-poppins text-2xl font-medium leading-12 text-center">Create an account</h1>
            <p className='font-poppins text-base font-normal leading-6 text-center text-[#666666]'>
                Already have an account?{' '}
                <span className="underline cursor-pointer" onClick={onSwitchToLogin}>Log in</span>
            </p>

            <p className='font-roboto mt-2 text-base font-normal leading-[21.09px] text-center text-[#666666]'>Enter your email address to create an account.</p>

            <form onSubmit={handleSubmit} className="flex flex-col px-8 items-start mt-2 gap-1.5">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}

                {/* First Name and Last Name in one row */}
                <div className="flex w-full gap-4">
                    <div className="flex-1">
                        <Label htmlFor="firstName" className='text-left text-[#666666]'>First Name</Label>
                        <Input
                            type="text"
                            id="firstName"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                        />
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="lastName" className='text-left text-[#666666]'>Last Name</Label>
                        <Input
                            type="text"
                            id="lastName"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                        />
                    </div>
                </div>
                <div className="flex w-full gap-4">
                    <div className="flex-1">
                        <Label htmlFor="designation" className='text-left text-[#666666]'>Designation</Label>
                        <Input
                            type="text"
                            id="designation"
                            placeholder="Designation"
                            value={designation}
                            onChange={(e) => setdesignation(e.target.value)}
                            required
                            className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                        />
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="company" className='text-left text-[#666666]'>Company</Label>
                        <Input
                            type="text"
                            id="company"
                            placeholder="Company Name"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            required
                            className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                        />
                    </div>
                </div>

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

                <Label htmlFor="cnfpassword" className='text-left text-[#666666]'>Confirm password</Label>
                <Input
                    type="password"
                    id="cnfpassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className='rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] px-4 py-2 w-full mt-1 hover:border-[#a6ce39]'
                />

                <Button type="submit" className='w-full bg-[#95D524] rounded-[27px] mt-6 px-8 text-black hover:bg-[#95b833]'>
                    Create an Account
                </Button>
            </form>
        </div>
    );
}

export default Signup;

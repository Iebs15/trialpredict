import React from 'react';
import logo from '../../assets/Insimine.svg';
import { useState } from 'react';
import Signup from '@/components/Authenticate/Signup';
import Login from '@/components/Authenticate/Login';

function Authenticate() {
    const [showSignup, setShowSignup] = useState(false);
    return (
        <div className='flex flex-col mt-8 ml-8'>
            <div className='flex'>
                <img src={logo} className='w-8 h-8'/>
            </div>
            <div className=' flex bg-custom-gradient h-[380px] mt-12 rounded-tl-[30px] justify-center rounded-bl-[30px]'>
                <div className='flex flex-row'>
                    <div className='flex flex-col justify-center mr-8'>
                        <h1 className='font-roboto text-3xl font-medium leading-[56.25px] text-right text-white' >Welcome to</h1>
                        <p className='font-roboto text-9xl font-medium leading-[56.25px] text-left text-white'>BioFormulate:</p>
                        {/* <p className='font-roboto text-9xl font-medium leading-[56.25px] text-left text-white'>PharmaX:</p> */}
                        <div className='flex flex-row'>
                        </div>
                    </div>
                    {showSignup ? (
                        <Signup onSwitchToLogin={() => setShowSignup(false)} />
                    ) : (
                        <Login onSwitchToSignup={() => setShowSignup(true)} />
                    )}

                </div>

            </div>
        </div>
    )
}

export default Authenticate
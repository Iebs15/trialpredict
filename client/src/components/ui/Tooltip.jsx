import React, { useState } from "react";

export function Tooltip({ children, content }) {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute top-0 left-0 transform translate-x-0 translate-y-0 mt-2 ml-2 w-max max-w-xs px-2 py-1 text-sm text-white bg-black rounded shadow-lg z-50">
                    {content}
                </div>
            )}


        </div>
    );
}

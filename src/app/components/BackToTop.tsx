"use client";

import { ArrowBigDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
    
    useEffect(() => {
        const handleScroll = () => {
            const backToTopButton = document.getElementById("back-to-top");
            if (backToTopButton) {
                if (window.scrollY > 300) {
                    backToTopButton.style.display = "block";
                } else {
                    backToTopButton.style.display = "none";
                }
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <button
            id="back-to-top"
            className="fixed bottom-10 right-4 rounded-full p-5 bg-accent/70 text-primary-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hidden"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
            <ArrowUp className="h-6 w-6" />
        </button>
    );
}
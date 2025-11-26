import React from "react";
import { FaFacebookF, FaDiscord, FaGithub, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';
import { FaPhoneAlt, FaHospital } from 'react-icons/fa';

export const footMenu = [
    {
        id: 1,
        title: "Services",
        menu: [
            {
                id: 1,
                link: "Book an Appointment",
                path: "/doctors",
                requiresAuth: true
            }
        ]
    },
    {
        id: 2,
        title: "Ours",
        menu: [
            {
                id: 1,
                link: "About Us",
                path: "/about"
            },
            {
                id: 2,
                link: "Rate Us",
                path: "/feedback",
                requiresAuth: true
            },
            {
                id: 3,
                link: "Privacy Policies",
                path: "/privacy"
            },
            {
                id: 4,
                link: "Contact Us",
                path: "/contact"
            },
        ]
    }
];

export const footSocial = [
    {
        id: 1,
        icon: <FaGithub />,
        cls: "github",
        path: "",
        external: true
    },
    {
        id: 2,
        icon: <IoMdMail />,
        cls: "mail",
        path: "mailto:contact@medicare.com",
        external: true
    },
    {
        id: 3,
        icon: <FaPhoneAlt />,
        cls: "phone",
        path: "tel:+1234567890",
        external: true
    },
    {
        id: 4,
        icon: <FaHospital />,
        cls: "hospital",
        path: "/about",
        external: false
    }
];

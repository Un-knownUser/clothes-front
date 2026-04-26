import "@/styles/globals.css";
import "@/styles/reset.css";
import "@/styles/variables.css";

import ClientSidebar from "@/contexts/ClientSidebar";
import {Toaster} from "sonner";

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
        <body>
            {children}
            <ClientSidebar />
        <Toaster
            position="top-center"
            richColors
            toastOptions={{
                style: {
                    background: "var(--white)",
                    color: "var(--black)",
                    boxShadow: "none",
                },
            }}
        />
        </body>
        </html>
    );
}

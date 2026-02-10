import "@/styles/globals.css";
import "@/styles/reset.css";
import "@/styles/variables.css";

import {AuthProvider} from "@/contexts/AuthContext";
import ClientSidebar from "@/contexts/ClientSidebar";
import {Toaster} from "sonner";

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
        <body>
        <AuthProvider>
            {children}
            <ClientSidebar />
        </AuthProvider>
        <Toaster
            position="top-center"
            richColors
            toastOptions={{
                style: {
                    background: "var(--white))",
                    color: "var(--black))",
                    boxShadow: "none",
                },
            }}
        />
        </body>
        </html>
    );
}

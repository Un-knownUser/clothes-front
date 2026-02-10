"use client";
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/module/sidebar/Sidebar';

export default function ClientSidebar() {
    const { token } = useAuth();
    return token ? <Sidebar /> : null;
}

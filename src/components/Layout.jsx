import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Navbar />
            <main className="container mx-auto py-6">
                <Outlet />
            </main>
        </div>
    );
}

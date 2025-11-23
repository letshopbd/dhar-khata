import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, List, LogOut } from "lucide-react";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(path)
            ? "bg-primary text-primary-foreground shadow-md transform scale-105"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`;

    const mobileNavLinkClass = (path) =>
        `flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all duration-300 ${isActive(path)
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`;

    return (
        <>
            {/* Desktop & Mobile Top Navbar */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                    <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        ধার খাতা
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link to="/" className={navLinkClass("/")}>
                            <LayoutDashboard className="w-4 h-4" />
                            ড্যাশবোর্ড
                        </Link>
                        <Link to="/add" className={navLinkClass("/add")}>
                            <PlusCircle className="w-4 h-4" />
                            নতুন ধার
                        </Link>
                        <Link to="/all" className={navLinkClass("/all")}>
                            <List className="w-4 h-4" />
                            সব তালিকা
                        </Link>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 rounded-full px-4"
                        >
                            <LogOut className="w-4 h-4" />
                            লগ আউট
                        </Button>
                    </div>

                    {/* Mobile Logout Button */}
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        size="sm"
                        className="md:hidden text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-safe">
                <div className="flex items-center justify-around px-2 py-2">
                    <Link to="/" className={mobileNavLinkClass("/")}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-xs">ড্যাশবোর্ড</span>
                    </Link>
                    <Link to="/add" className={mobileNavLinkClass("/add")}>
                        <PlusCircle className="w-5 h-5" />
                        <span className="text-xs">নতুন ধার</span>
                    </Link>
                    <Link to="/all" className={mobileNavLinkClass("/all")}>
                        <List className="w-5 h-5" />
                        <span className="text-xs">সব তালিকা</span>
                    </Link>
                </div>
            </nav>
        </>
    );
}

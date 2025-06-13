
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
    title?: string;
    showBackButton?: boolean;
    showLogout?: boolean;
}

const Header = ({
    title = "NextWorkout",
    showBackButton = false,
    showLogout = false
}: HeaderProps) => {
    const { signOut } = useAuth();
    const location = useLocation();
    const isHomePage = location.pathname === "/" || location.pathname === "/home";

    return (
        <header className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
                {isHomePage ? (
                    <img
                        src="/calendar.png"
                        alt="NextWorkout Logo"
                        className="h-6 w-6"
                    />
                ) : showBackButton ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white mr-1"
                        asChild
                    >
                        <Link to="/home">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                ) : null}
                <h1 className="text-xl font-bold">{title}</h1>
            </div>

            {showLogout && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="text-zinc-400 hover:text-white"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            )}
        </header>
    );
};

export default Header;

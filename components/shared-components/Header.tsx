"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, FileText, ShieldCheck, BadgeHelp, Copy, LogOut } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/dashboard", icon: <ShieldCheck size={28} /> },
  { name: "Plans", href: "/plans", icon: <ShieldCheck size={28} /> },
  { name: "Policies", href: "/policies", icon: <FileText size={28} /> },
  { name: "Claims", href: "/claims", icon: <BadgeHelp size={28} /> }
];

export default function Header() {
  const [active, setActive] = useState(NAV_LINKS[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window === "undefined") return;
      const userStr = localStorage.getItem("user");
      const jwt = localStorage.getItem("jwt");
      let user: any = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.phone) return;

      if (jwt) {
        const url =
          process.env.NODE_ENV === "development"
            ? `http://localhost:8000/api/v1/users/profile/${user.phone}`
            : `https://hima-g018.onrender.com/api/v1/users/profile/${user.phone}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        } else {
          setProfile(user); // fallback to localStorage minimal fields
        }
      } else {
        setProfile(user);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (!(e.target instanceof Element)) return;
      if (
        dropdownRef.current && dropdownRef.current.contains(e.target)
      ) return; // click INSIDE dropdown: ignore

      if (
        profileBtnRef.current && profileBtnRef.current.contains(e.target)
      ) {
        setDropdownOpen((open) => !open); // if click on PROFILE BUTTON, toggle dropdown
        return;
      }

      setDropdownOpen(false); // any other click: close
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", clickOutside);
      return () => document.removeEventListener("mousedown", clickOutside);
    }
  }, [dropdownOpen]);



  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      localStorage.removeItem("user_phone");
      setDropdownOpen(false);
      router.replace("/");
      console.log("logout")
      window.location.reload();
    }
  };

  return (
    <>
      <div className="w-full flex justify-center mt-8">
        <nav
          className="max-w-6xl w-full mx-auto bg-[#161616] rounded-full shadow-lg flex items-center justify-between px-10 py-5 md:flex hidden"
        >
          <img src="/icon.svg" alt="Logo" className="w-14 h-14 object-contain" />
          <div className="flex-1 flex items-center justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-7 py-2 text-base transition-all cursor-pointer ${active === link.name
                  ? "bg-[#d9fc09] text-[#161616] rounded-full shadow-md"
                  : "text-[#595959] hover:bg-[#292929] hover:text-[#d9fc09] rounded-full"
                  }`}
                onClick={() => setActive(link.name)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-10 relative">
            <div
              className="flex items-center px-4 py-3 bg-[#1d1c1d] gap-3 cursor-pointer select-none"
              style={{
                borderRadius: "9999px",
                boxShadow: "0 2px 8px rgba(45,45,45,0.15)",
                minWidth: 180
              }}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <img
                src={profile?.photoUrl || "/profile.jpg"}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover bg-[#222]"
              />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm text-white font-medium truncate">
                  {profile?.phone}
                </span>
              </div>
              <ChevronDown color="#d9fc09" size={22} strokeWidth={2.2} className="ml-2" />
            </div>
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 z-50 mt-2 w-80 bg-[#232323] rounded-2xl shadow-xl border border-[#2a2a2a] animate-fade-down"
                style={{ top: 68 }}
              >
                <div className="px-7 py-4 flex flex-col items-center gap-2">
                  <img
                    src={profile?.photoUrl || "/profile.jpg"}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover mb-2 bg-[#222]"
                  />
                  <div className="w-full text-center">
                    <span className="block text-lg font-bold text-white">
                      {profile?.name || "No name set"}
                    </span>
                    <span className="block text-sm text-[#d9fc09] mt-1">
                      {profile?.phone}
                    </span>
                  </div>
                  <div className="mt-4 w-full">
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <span className="text-gray-400 text-xs">Wallet Address</span>
                      <span
                        className="text-xs text-[#d9fc09] font-mono truncate max-w-[120px] cursor-pointer"
                        title={profile?.walletAddress}
                        onClick={() => profile?.walletAddress && copy(profile.walletAddress)}
                      >
                        {profile?.walletAddress
                          ? profile.walletAddress.slice(0, 8) + "..." + profile.walletAddress.slice(-6)
                          : "N/A"}
                        <Copy size={14} className="inline-block ml-2 align-middle" />
                      </span>
                    </div>
                    {!profile?.name && (
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-gray-500 text-xs italic">
                          (Add your profile details!)
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-[#1d1c1d] hover:bg-[#111] text-[#d9fc09] text-base font-semibold py-2 rounded-xl transition-all border border-[#232323] cursor-pointer"
                  >
                    <LogOut size={19} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
        <nav className="w-full max-w-6xl mx-auto flex items-center justify-between px-6 py-4 md:hidden">
          <img src="/icon.svg" alt="Logo" className="w-12 h-12 object-contain" />
          <div
            className="flex items-center px-2 py-2 bg-[#1d1c1d] gap-2 cursor-pointer"
            style={{
              borderRadius: "9999px",
              boxShadow: "0 2px 8px rgba(45,45,45,0.12)"
            }}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <img
              src={profile?.photoUrl || "/profile.jpg"}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover bg-[#222]"
            />
            <ChevronDown color="#d9fc09" size={20} strokeWidth={2.2} className="ml-1" />
          </div>
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-7 top-16 z-50 w-72 bg-[#232323] rounded-2xl shadow-xl border border-[#2a2a2a] animate-fade-down"
            >
              <div className="px-6 py-4 flex flex-col items-center gap-2">
                <img
                  src={profile?.photoUrl || "/profile.jpg"}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover mb-2 bg-[#222]"
                />
                <span className="block text-lg font-bold text-white">
                  {profile?.name || "No name set"}
                </span>
                <span className="block text-sm text-[#d9fc09]">
                  {profile?.phone}
                </span>
                <div className="mt-4 w-full flex items-center gap-2 justify-center">
                  <span className="text-gray-400 text-xs">Wallet</span>
                  <span
                    className="text-xs text-[#d9fc09] font-mono truncate max-w-[100px] cursor-pointer"
                    title={profile?.walletAddress}
                    onClick={() => profile?.walletAddress && copy(profile.walletAddress)}
                  >
                    {profile?.walletAddress
                      ? profile.walletAddress.slice(0, 8) + "..." + profile.walletAddress.slice(-6)
                      : "N/A"}
                    <Copy size={13} className="inline-block ml-2 align-middle" />
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#1d1c1d] hover:bg-[#111] text-[#d9fc09] text-base font-semibold py-2 rounded-xl transition-all border border-[#232323] cursor-pointer"
                >
                  <LogOut size={17} /> Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
      <div className="fixed left-0 bottom-0 w-full z-50 md:hidden flex justify-center pb-4 pointer-events-none">
        <div className="flex items-center justify-center bg-[#161616] rounded-full shadow-lg px-6 py-2 w-[96%] pointer-events-auto">
          {NAV_LINKS.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className={`mx-3 p-3 rounded-full transition-all flex flex-col items-center cursor-pointer
                ${active === link.name
                  ? "bg-[#d9fc09] text-[#161616] shadow"
                  : "text-[#e3e3e3] hover:bg-[#292929] hover:text-[#d9fc09]"
                }`}
              onClick={() => setActive(link.name)}
            >
              <span className="block">{link.icon}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

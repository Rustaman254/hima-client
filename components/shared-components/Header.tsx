"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, FileText, ShieldCheck, BadgeHelp, Copy, LogOut, Home, Layers } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Plans", href: "/plans", icon: Layers },
  { name: "Policies", href: "/policies", icon: FileText },
  { name: "Claims", href: "/claims", icon: BadgeHelp }
];

interface UserProfile {
  phone: string;
  photoUrl?: string;
  name?: string;
  walletAddress?: string;
}

export default function Header() {
  const [active, setActive] = useState(NAV_LINKS[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window === "undefined") return;
      const userStr = localStorage.getItem("user");
      const jwt = localStorage.getItem("jwt");
      const user: UserProfile | null = userStr ? JSON.parse(userStr) : null;
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
          setProfile(user);
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
      
      // Don't close if clicking inside dropdown
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
        return;
      }
      
      // Don't close if clicking the profile button (toggle handled separately)
      if (profileBtnRef.current && profileBtnRef.current.contains(e.target)) {
        return;
      }
      
      // Close if clicking outside
      setDropdownOpen(false);
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
      console.log("logout");
      window.location.reload();
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="w-full flex justify-center pt-6 pb-4">
        <nav className="max-w-7xl w-full mx-auto bg-[#161616] rounded-2xl shadow-xl border border-[#232323] flex items-center justify-between px-8 py-4 md:flex hidden">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-[#d9fc09] p-2 rounded-xl">
              <Image
                src="/icon.svg"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold text-white">BodaBoda</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    active === link.name
                      ? "bg-[#d9fc09] text-[#161616] shadow-md"
                      : "text-gray-400 hover:bg-[#232323] hover:text-white"
                  }`}
                  onClick={() => setActive(link.name)}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button
              ref={profileBtnRef}
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-3 px-4 py-2.5 bg-[#232323] hover:bg-[#2a2a2a] rounded-xl border border-[#2a2a2a] transition-all cursor-pointer"
            >
              <Image
                src={profile?.photoUrl || "/profile.jpg"}
                alt="Profile"
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg object-cover bg-[#1a1a1a]"
                priority
              />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm text-white font-medium truncate max-w-[120px]">
                  {profile?.name || "User"}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {profile?.phone}
                </span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-[#d9fc09] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-3 w-80 bg-[#161616] rounded-2xl shadow-2xl border border-[#232323] z-50 animate-fade-down"
              >
                <div className="p-6">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <Image
                        src={profile?.photoUrl || "/profile.jpg"}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-2xl object-cover bg-[#1a1a1a] border-2 border-[#232323]"
                        priority
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#161616]"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {profile?.name || "No name set"}
                    </h3>
                    <p className="text-sm text-[#d9fc09] font-medium">
                      {profile?.phone}
                    </p>
                  </div>

                  {/* Wallet Info */}
                  <div className="bg-[#232323] rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Wallet Address</span>
                      <Copy 
                        size={14} 
                        className="text-gray-500 hover:text-[#d9fc09] cursor-pointer transition"
                        onClick={() => profile?.walletAddress && copy(profile.walletAddress)}
                      />
                    </div>
                    <div className="font-mono text-sm text-white break-all">
                      {profile?.walletAddress
                        ? `${profile.walletAddress.slice(0, 12)}...${profile.walletAddress.slice(-10)}`
                        : "No wallet connected"}
                    </div>
                  </div>

                  {/* Profile Status */}
                  {!profile?.name && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
                      <p className="text-xs text-yellow-400 text-center">
                        Complete your profile to unlock all features
                      </p>
                    </div>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white py-3 rounded-xl transition-all border border-[#2a2a2a] font-medium group"
                  >
                    <LogOut size={18} className="text-gray-400 group-hover:text-[#d9fc09] transition" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Header */}
        <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-[#d9fc09] p-2 rounded-lg">
              <Image
                src="/icon.svg"
                alt="Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
                priority
              />
            </div>
            <span className="text-base font-bold text-white">BodaBoda</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 bg-[#232323] rounded-xl border border-[#2a2a2a]"
            >
              <Image
                src={profile?.photoUrl || "/profile.jpg"}
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover bg-[#1a1a1a]"
                priority
              />
              <ChevronDown 
                size={16} 
                className={`text-[#d9fc09] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-3 w-72 bg-[#161616] rounded-2xl shadow-2xl border border-[#232323] z-50"
              >
                <div className="p-5">
                  <div className="flex flex-col items-center mb-5">
                    <Image
                      src={profile?.photoUrl || "/profile.jpg"}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover mb-3 bg-[#1a1a1a] border-2 border-[#232323]"
                      priority
                    />
                    <h3 className="text-base font-bold text-white mb-1">
                      {profile?.name || "No name set"}
                    </h3>
                    <p className="text-sm text-[#d9fc09]">
                      {profile?.phone}
                    </p>
                  </div>

                  <div className="bg-[#232323] rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Wallet</span>
                      <Copy 
                        size={12} 
                        className="text-gray-500 cursor-pointer"
                        onClick={() => profile?.walletAddress && copy(profile.walletAddress)}
                      />
                    </div>
                    <div className="font-mono text-xs text-white break-all">
                      {profile?.walletAddress
                        ? `${profile.walletAddress.slice(0, 10)}...${profile.walletAddress.slice(-8)}`
                        : "No wallet"}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white py-2.5 rounded-xl transition-all border border-[#2a2a2a] text-sm font-medium"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed left-0 bottom-0 w-full z-50 md:hidden flex justify-center pb-4 px-3 pointer-events-none">
        <div className="flex items-center justify-around bg-[#161616] rounded-2xl shadow-2xl border border-[#232323] w-full max-w-md py-3 pointer-events-auto">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  active === link.name
                    ? "bg-[#d9fc09] text-[#161616]"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActive(link.name)}
              >
                <Icon size={22} />
                <span className="text-xs font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
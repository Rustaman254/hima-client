"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

type Country = {
  label: string;
  code: string;
  dialCode: string;
  validation: RegExp;
};

const COUNTRIES: Country[] = [
  { label: "KE (+254)", code: "KE", dialCode: "+254", validation: /^\d{9}$/ },
  { label: "US (+1)", code: "US", dialCode: "+1", validation: /^\d{10}$/ },
  { label: "UK (+44)", code: "GB", dialCode: "+44", validation: /^\d{10}$/ },
];

type OnboardingFields = {
  name: string;
  photoUrl: string;
  nationalId: string;
  bodaRegNo: string;
  mobileMoneyNumber: string;
  coverageLevel: string;
};

const onboardingFieldOrder: (keyof OnboardingFields)[] = [
  "name",
  "photoUrl",
  "nationalId",
  "bodaRegNo",
  "mobileMoneyNumber",
  "coverageLevel",
];

export default function Home() {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [msisdn, setMsisdn] = useState<string>("");
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingFields>({
    name: "",
    photoUrl: "",
    nationalId: "",
    bodaRegNo: "",
    mobileMoneyNumber: "",
    coverageLevel: "",
  });
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const router = useRouter();
  const otpInputs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const baseURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/api/v1"
      : "https://hima-g018.onrender.com/api/v1";
  const getFullPhone = () => country.dialCode + msisdn;

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!country.validation.test(msisdn)) {
      toast.error(`Invalid phone number format for ${country.label}.`);
      return;
    }
    setLoading(true);
    if (mode === "signup") {
      const res1 = await fetch(`${baseURL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: getFullPhone() }),
      });
      if (!res1.ok) {
        setLoading(false);
        toast.error((await res1.json()).message || "Registration failed");
        return;
      }
      toast.success("Registered! Now verify OTP.");
      const res2 = await fetch(`${baseURL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: getFullPhone() }),
      });
      setLoading(false);
      if (res2.ok) setShowOtp(true);
      else toast.error((await res2.json()).message || "Failed to send OTP");
    } else {
      const res = await fetch(`${baseURL}/auth/login/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: getFullPhone() }),
      });
      setLoading(false);
      if (res.ok) setShowOtp(true);
      else {
        const data = await res.json();
        toast.error(data.message || "Failed to request OTP");
        if (data.message?.toLowerCase().includes("not found")) {
          setMode("signup");
          setShowOtp(false);
          setOtp(["", "", "", "", "", ""]);
        }
      }
    }
  };

  const handleOtpVerification = async (
    e: React.FormEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (otp.join("").length !== 6) return;
    setVerifying(true);
    setLoading(true);

    let endpoint: string;
    let body: Record<string, unknown>;
    if (mode === "signup") {
      endpoint = `${baseURL}/auth/verify-otp`;
      body = {
        phone: getFullPhone(),
        otp: otp.join(""),
        blockchainNetworks: ["base", "celo"],
      };
    } else {
      endpoint = `${baseURL}/auth/login/verify-otp`;
      body = {
        phone: getFullPhone(),
        otp: otp.join(""),
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("jwt", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          phone: data.user.phone,
          phoneVerified: data.user.phoneVerified,
          walletAddress: data.user.walletAddress,
          smartWalletAddress: data.user.smartWalletAddress,
          onboardingSteps: data.user.onboardingSteps,
        })
      );
      localStorage.setItem("user_phone", data.user.phone);

      if (mode === "signup") {
        setTimeout(() => {
          setVerifying(false);
          setShowOnboarding(true);
          setLoading(false);
        }, 1200);
      } else {
        setVerifying(false);
        setLoading(false);
        router.push("/dashboard");
      }
    } else {
      setVerifying(false);
      setLoading(false);
      toast.error((await res.json()).message || "OTP verification failed");
    }
  };

  const handleOnboarding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOnboardingLoading(true);
    const res = await fetch(`${baseURL}/auth/onboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: getFullPhone(), ...onboarding }),
    });
    setOnboardingLoading(false);
    if (res.ok) {
      toast.success("Congratulations! Your profile is updated.");
      router.push("/dashboard");
    } else {
      toast.error((await res.json()).message || "Failed to update profile");
    }
  };

  const setOtpAt = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    setOtp((prev) => {
      const arr = [...prev];
      arr[index] = value;
      return arr;
    });
    if (value && index < 5) otpInputs[index + 1].current?.focus();
    if (!value && index > 0) otpInputs[index - 1].current?.focus();
  };

  const Spinner = () => (
    <div className="flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-[#d9fc09] border-t-transparent animate-spin rounded-full" />
    </div>
  );

  const wittyMessages = [
    "Polishing your shiny new wallet...",
    "Tying up some blockchain shoelaces...",
    "Juggling digital coins. Almost done!",
    "Allocating magic internet money...",
    "Summoning crypto wizards. Please stand by...",
    "Whispering sweet nothings to the blockchains...",
    "Gently nudging validators to move faster...",
    "Please don’t close this tab — your assets thank you!",
    "Performing cryptographic dance. Don’t blink!",
  ];
  const wittyMsg =
    wittyMessages[Math.floor(performance.now() / 3000) % wittyMessages.length];
  const title = mode === "signup" ? "Create an Account" : "Welcome Back";
  const allOnboardingFilled = onboardingFieldOrder.every(
    (k) => onboarding[k] && onboarding[k].trim()
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0a0b0b" }}
    >
      <div className="w-full max-w-md p-10 rounded-xl relative flex flex-col justify-center">
        <div className="flex justify-center mb-10">
          <Image
            src="/icon.svg"
            alt="Logo"
            width={104}
            height={104}
            className="w-26 h-26 md:w-23 md:h-23 object-contain"
            priority
          />
        </div>
        <h1 className="text-white text-4xl font-semibold text-center mb-10">
          {title}
        </h1>
        {verifying ? (
          <div className="flex flex-col items-center w-full gap-10 min-h-[320px]">
            <Spinner />
            <div className="text-white text-xl text-center px-2 animate-pulse">
              {wittyMsg}
            </div>
          </div>
        ) : showOnboarding ? (
          <form
            className="space-y-5"
            spellCheck={false}
            autoComplete="off"
            onSubmit={handleOnboarding}
          >
            <div className="mb-2 text-white text-xl text-center font-semibold">
              Optional: Complete Your Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {onboardingFieldOrder.map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  value={onboarding[field]}
                  onChange={(e) =>
                    setOnboarding((o) => ({ ...o, [field]: e.target.value }))
                  }
                  className="px-5 py-4 rounded-full bg-[#1d1c1d] text-white text-base outline-none border-2 border-[#232323] focus:border-[#d9fc09] transition-colors"
                  required
                />
              ))}
            </div>
            <div className="flex gap-2 justify-between pt-2">
              <button
                type="submit"
                className={`flex-1 px-4 py-4 rounded-full text-black text-base font-semibold transition-all cursor-pointer ${
                  !allOnboardingFilled ? "bg-gray-500 cursor-not-allowed text-gray-200" : ""
                }`}
                style={allOnboardingFilled ? { backgroundColor: "#d9fc09" } : {}}
                disabled={!allOnboardingFilled || onboardingLoading}
              >
                {onboardingLoading ? "Updating…" : "Finish & Go to Dashboard"}
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-4 rounded-full border border-[#d9fc09] bg-black text-base font-semibold cursor-pointer transition-all ${
                  !allOnboardingFilled ? "bg-gray-700 text-gray-300 border-gray-700 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  toast.success("Congratulations! Your profile is updated.");
                  router.push("/dashboard");
                }}
                disabled={!allOnboardingFilled}
              >
                Skip
              </button>
            </div>
          </form>
        ) : !showOtp ? (
          <form className="space-y-5" autoComplete="off">
            <div>
              <div className="flex items-center">
                <div className="relative flex items-center">
                  <select
                    value={country.code}
                    onChange={(e) => {
                      const selected = COUNTRIES.find(
                        (c) => c.code === e.target.value
                      );
                      if (selected) setCountry(selected);
                    }}
                    className="rounded-full cursor-pointer px-4 py-4 bg-[#1d1c1d] text-white outline-none transition-colors appearance-none min-w-[130px] pr-10 border-2 border-[#2a292a] hover:border-[#d9fc09] focus:border-[#d9fc09]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 pointer-events-none flex items-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M7 8l3 3 3-3"
                        stroke="#d9fc09"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
                <span className="mx-1 text-gray-400">|</span>
                <input
                  type="tel"
                  id="msisdn"
                  value={msisdn}
                  onChange={(e) =>
                    setMsisdn(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="Enter phone number"
                  required
                  className="flex-1 px-5 py-4 rounded-full text-white text-base outline-none transition-colors"
                  style={{ backgroundColor: "#1d1c1d" }}
                  onFocus={(e) =>
                    (e.target as HTMLInputElement).style.backgroundColor =
                      "#2a292a"
                  }
                  onBlur={(e) =>
                    (e.target as HTMLInputElement).style.backgroundColor =
                      "#1d1c1d"
                  }
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-4 py-4 rounded-full text-black text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 mt-2.5 cursor-pointer"
              style={{ backgroundColor: "#d9fc09" }}
            >
              {loading
                ? mode === "signup"
                  ? "Processing..."
                  : "Requesting OTP..."
                : mode === "signup"
                ? "Sign Up"
                : "Log In"}
            </button>
            <div className="text-center mt-5 flex flex-col items-center">
              {mode === "signup" ? (
                <span className="text-gray-400">
                  Have an account?{" "}
                  <button
                    type="button"
                    className="font-semibold cursor-pointer"
                    style={{ color: "#d9fc09" }}
                    onClick={() => {
                      setMode("login");
                      setShowOtp(false);
                    }}
                  >
                    Login
                  </button>
                </span>
              ) : (
                <span className="text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="font-semibold cursor-pointer"
                    style={{ color: "#d9fc09" }}
                    onClick={() => {
                      setMode("signup");
                      setShowOtp(false);
                    }}
                  >
                    Sign Up
                  </button>
                </span>
              )}
            </div>
          </form>
        ) : (
          <form className="space-y-5" autoComplete="off">
            <label
              htmlFor="otp"
              className="block text-gray-400 text-sm mb-2 text-center"
            >
              Enter OTP
            </label>
            <div className="flex gap-2 w-full justify-between">
              {otp.map((v, i) => (
                <input
                  ref={otpInputs[i]}
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  pattern="[0-9]*"
                  className="flex-1 h-12 w-10 text-center text-2xl font-mono rounded-full border-2 border-[#2a292a] focus:border-[#d9fc09] transition-all bg-[#1d1c1d] text-white outline-none shadow-sm cursor-pointer"
                  value={v}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setOtpAt(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Backspace" || e.key === "ArrowLeft") &&
                      i > 0 &&
                      !otp[i]
                    ) {
                      otpInputs[i - 1].current?.focus();
                    } else if (e.key === "ArrowRight" && i < 5) {
                      otpInputs[i + 1].current?.focus();
                    }
                  }}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {!verifying && (
              <button
                type="button"
                onClick={(e) => {
                  if (otp.join("").length === 6)
                    handleOtpVerification(e as any);
                  else toast.error("Please fill all OTP digits.");
                }}
                disabled={loading || otp.join("").length !== 6}
                className="w-full px-4 py-4 rounded-full text-black text-base font-semibold transition-all mt-2.5 cursor-pointer"
                style={{ backgroundColor: "#d9fc09" }}
              >
                Verify and Continue
              </button>
            )}
            <div className="text-center mt-5 flex flex-col items-center">
              {mode === "signup" ? (
                <span className="text-gray-400">
                  Have an account?{" "}
                  <button
                    type="button"
                    className="font-semibold cursor-pointer"
                    style={{ color: "#d9fc09" }}
                    onClick={() => {
                      setMode("login");
                      setShowOtp(false);
                      setOtp(["", "", "", "", "", ""]);
                    }}
                  >
                    Login
                  </button>
                </span>
              ) : (
                <span className="text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="font-semibold cursor-pointer"
                    style={{ color: "#d9fc09" }}
                    onClick={() => {
                      setMode("signup");
                      setShowOtp(false);
                      setOtp(["", "", "", "", "", ""]);
                    }}
                  >
                    Sign Up
                  </button>
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

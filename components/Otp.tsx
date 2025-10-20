"use client";
import { useState, useRef } from "react";

export default function OtpInput({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputRefs = Array.from({ length: 5 }, () => useRef<HTMLInputElement>(null));
  const [error, setError] = useState("");

  const handleChange = (idx: number, val: string) => {
    if (/^\d?$/.test(val)) {
      const o = [...otp];
      o[idx] = val;
      setOtp(o);
      if (val && idx < 4) inputRefs[idx + 1].current?.focus();
    }
  };
  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs[idx - 1].current?.focus();
  };
  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    // Replace "12345" below with your real validation logic
    if (code.length === 5) {
      if (code === "12345") onSuccess();
      else setError("Invalid OTP. Please try again.");
    } else {
      setError("Please enter all 5 digits.");
    }
  };

  return (
    <form onSubmit={handleOTPSubmit} className="flex flex-col items-center">
      <h2 className="text-white text-2xl font-semibold mb-8 text-center">
        Enter the 5-digit OTP sent to {email}
      </h2>
      <div className="flex gap-4 mb-6">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={inputRefs[idx]}
            type="text"
            maxLength={1}
            inputMode="numeric"
            className="w-12 h-12 rounded-full text-center text-2xl border-2 outline-none"
            style={{
              backgroundColor: "#1d1c1d",
              color: "white",
              borderColor: "#d9fc09"
            }}
            value={digit}
            onChange={e => handleChange(idx, e.target.value)}
            onKeyDown={e => handleKeyDown(idx, e)}
          />
        ))}
      </div>
      {error && (
        <div className="text-red-400 mb-4 text-center text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        className="w-full py-3 rounded-full font-semibold text-lg"
        style={{
          backgroundColor: "#d9fc09",
          color: "#161616",
          boxShadow: "0 4px 12px rgba(217, 252, 9, 0.3)"
        }}
      >
        Submit OTP
      </button>
    </form>
  );
}

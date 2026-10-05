"use client";

import { useState } from "react";
import { CreditCard, Fingerprint, Smile, Wifi, WifiOff } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { DEVICES } from "@/lib/mockData";
import type { AttendanceSource } from "@/lib/types";

const DEVICE_ICONS: Record<AttendanceSource, React.ReactNode> = {
  hid_card:    <CreditCard   className="w-6 h-6" />,
  fingerprint: <Fingerprint  className="w-6 h-6" />,
  face_scan:   <Smile        className="w-6 h-6" />,
  manual:      <CreditCard   className="w-6 h-6" />,
};

const DEVICE_LABELS: Record<AttendanceSource, string> = {
  hid_card:    "HID Card Reader",
  fingerprint: "Fingerprint Scanner",
  face_scan:   "Face Scanner",
  manual:      "Manual",
};

const DEVICE_COLORS: Record<AttendanceSource, string> = {
  hid_card:    "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  fingerprint: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100",
  face_scan:   "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
  manual:      "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100",
};

const PULSE_COLORS: Record<AttendanceSource, string> = {
  hid_card:    "bg-blue-400",
  fingerprint: "bg-violet-400",
  face_scan:   "bg-emerald-400",
  manual:      "bg-gray-400",
};

export default function DeviceSimulator() {
  const { devicePunch, clockedIn } = useApp();
  const { showToast } = useToast();
  const [pulsing, setPulsing] = useState<string | null>(null);

  function handlePunch(deviceId: string, source: AttendanceSource, deviceName: string) {
    setPulsing(deviceId);
    setTimeout(() => setPulsing(null), 800);

    const result = devicePunch(source);
    const now = new Date().toTimeString().slice(0, 8);
    const action = result === "clocked-in" ? "Clock-in" : "Clock-out";
    showToast(`✓ Punch received from ${deviceName} — ${action} at ${now}`, "success");
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      data-testid="device-simulator"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Device Simulator</h2>
          <p className="text-xs text-gray-500 mt-0.5">Demo — simulate punch events from physical devices</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Simulator Mode
        </span>
      </div>

      {/* Current status */}
      <div className={`flex items-center gap-2 mb-5 px-3 py-2 rounded-lg text-xs font-medium ${
        clockedIn ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-600"
      }`}>
        <span className={`w-2 h-2 rounded-full ${clockedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
        {clockedIn ? "Currently clocked in — next punch will clock you out" : "Currently clocked out — next punch will clock you in"}
      </div>

      {/* Device cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEVICES.map((device) => {
          const isPulsing = pulsing === device.id;
          const colorCls = DEVICE_COLORS[device.type] ?? DEVICE_COLORS.manual;
          const pulseCls = PULSE_COLORS[device.type] ?? PULSE_COLORS.manual;

          return (
            <button
              key={device.id}
              onClick={() => handlePunch(device.id, device.type, device.name)}
              disabled={device.status === "offline"}
              data-testid={`device-btn-${device.id}`}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${colorCls} ${
                isPulsing ? "scale-95" : "hover:-translate-y-0.5 hover:shadow-md"
              }`}
              aria-label={`Punch via ${DEVICE_LABELS[device.type]} at ${device.name}`}
            >
              {/* Pulse ring on activation */}
              {isPulsing && (
                <span className={`absolute inset-0 rounded-xl ${pulseCls} opacity-20 animate-ping`} />
              )}

              {/* Device icon */}
              <div className="relative">{DEVICE_ICONS[device.type]}</div>

              {/* Name + location */}
              <div className="text-center">
                <p className="text-sm font-semibold">{device.name}</p>
                <p className="text-xs opacity-70 mt-0.5">{device.location}</p>
                <p className="text-xs opacity-60">{DEVICE_LABELS[device.type]}</p>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1 text-xs">
                {device.status === "online" ? (
                  <><Wifi className="w-3 h-3" /> <span>Online</span></>
                ) : (
                  <><WifiOff className="w-3 h-3" /> <span>Offline</span></>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

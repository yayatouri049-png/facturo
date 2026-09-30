import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Gift, AlertTriangle, Download, Loader2, Clapperboard } from "lucide-react";
import { USE_AD_SIMULATION, AD_SIMULATION_SECONDS, REWARDED_AD_UNIT } from "@/lib/adConfig";

// phases: intro | loading | playing | granted | error
export default function RewardedAdDialog({ open, onOpenChange, onReward, t, dir }) {
  const [phase, setPhase] = useState("intro");
  const [remaining, setRemaining] = useState(AD_SIMULATION_SECONDS);
  const timerRef = useRef(null);
  const grantTimeoutRef = useRef(null);
  const rewardedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (grantTimeoutRef.current) {
      clearTimeout(grantTimeoutRef.current);
      grantTimeoutRef.current = null;
    }
  };

  // reset state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setPhase("intro");
      setRemaining(AD_SIMULATION_SECONDS);
      rewardedRef.current = false;
    } else {
      clearTimer();
    }
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  const grantReward = useCallback(() => {
    if (rewardedRef.current) return;
    rewardedRef.current = true;
    setPhase("granted");
    // let the user see the success state briefly, then download + close
    grantTimeoutRef.current = setTimeout(() => {
      onReward();
      onOpenChange(false);
    }, 1100);
  }, [onReward, onOpenChange]);

  // simulation countdown — effect-driven so it is StrictMode-safe
  useEffect(() => {
    if (phase !== "playing" || !USE_AD_SIMULATION) return undefined;
    if (remaining <= 0) {
      grantReward();
      return undefined;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, remaining, grantReward]);

  const startSimulation = useCallback(() => {
    rewardedRef.current = false;
    setRemaining(AD_SIMULATION_SECONDS);
    setPhase("playing");
  }, []);

  // Real Google Publisher Tag rewarded flow
  const startRealAd = useCallback(() => {
    setPhase("loading");
    const gt = window.googletag;
    if (!gt || !gt.cmd) {
      setPhase("error");
      return;
    }
    let settled = false;
    const failTimeout = setTimeout(() => {
      if (!settled) setPhase("error");
    }, 6000);

    gt.cmd.push(function () {
      try {
        const slot = gt.defineOutOfPageSlot(REWARDED_AD_UNIT, gt.enums.OutOfPageFormat.REWARDED);
        if (!slot) {
          settled = true;
          clearTimeout(failTimeout);
          setPhase("error");
          return;
        }
        slot.addService(gt.pubads());
        gt.pubads().addEventListener("rewardedSlotReady", (e) => {
          settled = true;
          clearTimeout(failTimeout);
          setPhase("playing");
          e.makeRewardedVisible();
        });
        gt.pubads().addEventListener("rewardedSlotGranted", () => {
          grantReward();
        });
        gt.pubads().addEventListener("rewardedSlotClosed", () => {
          if (!rewardedRef.current) setPhase("intro");
        });
        gt.enableServices();
        gt.display(slot);
      } catch (err) {
        settled = true;
        clearTimeout(failTimeout);
        setPhase("error");
      }
    });
  }, [grantReward]);

  const handleWatch = () => {
    if (USE_AD_SIMULATION) startSimulation();
    else startRealAd();
  };

  const handleDirectDownload = () => {
    onReward();
    onOpenChange(false);
  };

  const progress = ((AD_SIMULATION_SECONDS - remaining) / AD_SIMULATION_SECONDS) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        data-testid="rewarded-ad-dialog"
        className="border-[#282e42] bg-[#141826] text-slate-200 sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Gift className="h-5 w-5 text-violet-400" />
            {t.adTitle}
          </DialogTitle>
          <DialogDescription className="text-slate-400">{t.adMessage}</DialogDescription>
        </DialogHeader>

        {/* Ad stage */}
        <div className="my-2 flex min-h-[168px] flex-col items-center justify-center rounded-xl border border-[#282e42] bg-[#0e1220] p-6 text-center">
          {phase === "intro" && (
            <div className="flex flex-col items-center gap-3 fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/30 to-blue-600/20 ring-1 ring-violet-500/40">
                <Clapperboard className="h-7 w-7 text-violet-300" />
              </div>
              <p className="text-xs text-slate-500">
                {USE_AD_SIMULATION ? `${t.adSimulating} (${AD_SIMULATION_SECONDS}s)` : "Google Rewarded Ad"}
              </p>
            </div>
          )}

          {phase === "loading" && (
            <div className="flex flex-col items-center gap-3 fade-in">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <p className="text-sm text-slate-400">{t.adLoading}</p>
            </div>
          )}

          {phase === "playing" && (
            <div className="w-full fade-in" data-testid="ad-playing-state">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                {USE_AD_SIMULATION ? `${t.adSimulating} (${remaining}s)...` : t.adLoading}
              </div>
              <div className="relative mb-3 flex h-24 items-center justify-center overflow-hidden rounded-lg bg-black">
                <span className="text-4xl font-extrabold tabular-nums text-white/90">
                  {USE_AD_SIMULATION ? remaining : "AD"}
                </span>
                <span className="absolute right-2 top-2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70">
                  Ad
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#282e42]">
                <div
                  data-testid="ad-progress-bar"
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${USE_AD_SIMULATION ? progress : 40}%` }}
                />
              </div>
            </div>
          )}

          {phase === "granted" && (
            <div className="flex flex-col items-center gap-3 fade-in" data-testid="ad-granted-state">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/50">
                <Gift className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-emerald-300">{t.adGranted}</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Download className="h-3.5 w-3.5" /> {t.adDownloading}
              </p>
            </div>
          )}

          {phase === "error" && (
            <div className="flex flex-col items-center gap-3 fade-in" data-testid="ad-error-state">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/50">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-amber-200">{t.adBlocked}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {phase === "intro" && (
            <Button
              data-testid="ad-watch-button"
              onClick={handleWatch}
              className="glow-violet h-11 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
            >
              <Play className="mr-2 h-4 w-4" /> {t.adWatch}
            </Button>
          )}

          {phase === "error" && (
            <Button
              data-testid="ad-direct-download-button"
              onClick={handleDirectDownload}
              className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <Download className="mr-2 h-4 w-4" /> {t.adDirect}
            </Button>
          )}

          {(phase === "intro" || phase === "error") && (
            <Button
              data-testid="ad-cancel-button"
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="h-9 w-full text-slate-400 hover:bg-[#1a2030] hover:text-slate-200"
            >
              {t.adCancel}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Crown, CreditCard, Zap, Check } from "lucide-react";

export const AnimatedUpgradeDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { icon: Crown, text: "Select your plan", color: "text-accent" },
    { icon: CreditCard, text: "Secure payment", color: "text-blue-500" },
    { icon: Zap, text: "Instant activation", color: "text-yellow-500" },
    { icon: Check, text: "You're upgraded!", color: "text-green-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="relative aspect-video rounded-lg border-2 border-accent/30 overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
        {/* Animated icon with glow */}
        <div className="relative">
          <div className={`absolute inset-0 ${currentStep.color} opacity-20 blur-2xl animate-pulse`} />
          <div className={`relative bg-background/80 backdrop-blur-sm p-6 rounded-2xl border-2 ${currentStep.color.replace('text-', 'border-')} transition-all duration-500 animate-scale-in`}>
            <Icon className={`h-16 w-16 ${currentStep.color}`} />
          </div>
        </div>

        {/* Step text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold animate-fade-in">{currentStep.text}</h3>
          <div className="flex gap-2 justify-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-accent" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mock plan cards */}
        <div className="flex gap-3 animate-fade-in">
          {step === 0 && (
            <>
              <div className="w-20 h-24 bg-card rounded-lg border-2 border-primary/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-semibold">Free</div>
                  <div className="text-lg font-bold">₹0</div>
                </div>
              </div>
              <div className="w-20 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-accent flex items-center justify-center scale-110 shadow-lg">
                <div className="text-center">
                  <Crown className="h-4 w-4 mx-auto mb-1 text-accent" />
                  <div className="text-xs font-semibold">Pro</div>
                  <div className="text-lg font-bold">₹299</div>
                </div>
              </div>
              <div className="w-20 h-24 bg-card rounded-lg border-2 border-primary/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-semibold">Premium</div>
                  <div className="text-lg font-bold">₹999</div>
                </div>
              </div>
            </>
          )}
          
          {step === 1 && (
            <div className="w-64 h-24 bg-card/80 backdrop-blur-sm rounded-lg border-2 border-blue-500/50 p-4 flex items-center gap-3 animate-scale-in">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <div className="h-2 bg-blue-500/20 rounded mb-2" style={{ width: '80%' }} />
                <div className="h-2 bg-blue-500/20 rounded" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="text-center space-y-2 animate-scale-in">
              <div className="flex items-center gap-2 text-green-500">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Processing...</span>
              </div>
              {step === 3 && (
                <div className="flex items-center gap-2 text-green-500 animate-fade-in">
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">Upgrade Complete!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step counter badge */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border text-sm font-medium">
        Step {step + 1}/{steps.length}
      </div>
    </div>
  );
};

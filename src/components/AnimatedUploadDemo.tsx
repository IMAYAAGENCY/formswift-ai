import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, Check } from "lucide-react";

export const AnimatedUploadDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { icon: Upload, text: "Choose your form file", color: "text-primary" },
    { icon: FileText, text: "File uploading...", color: "text-blue-500" },
    { icon: Sparkles, text: "AI processing form...", color: "text-purple-500" },
    { icon: Check, text: "Form filled successfully!", color: "text-green-500" },
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
    <div className="relative aspect-video rounded-lg border-2 border-primary/30 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8">
        {/* Animated icon */}
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
                  i === step ? "w-8 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mock form preview */}
        <div className="w-full max-w-xs space-y-2 animate-fade-in">
          {step >= 2 && (
            <>
              <div className="h-3 bg-primary/20 rounded animate-pulse" style={{ width: '80%' }} />
              <div className="h-3 bg-primary/20 rounded animate-pulse" style={{ width: '65%' }} />
              <div className="h-3 bg-primary/20 rounded animate-pulse" style={{ width: '90%' }} />
            </>
          )}
        </div>

        {/* Progress indicator */}
        {step === 1 && (
          <div className="w-full max-w-xs">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>

      {/* Step counter badge */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border text-sm font-medium">
        Step {step + 1}/{steps.length}
      </div>
    </div>
  );
};

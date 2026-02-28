import { Button } from "@/components/ui/button";
import {
  Camera,
  CheckCircle,
  CreditCard,
  GraduationCap,
  LogIn,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

const features = [
  {
    icon: GraduationCap,
    title: "Built for Schools & Colleges",
    description:
      "Purpose-built for educational institutions — manage bulk student and staff ID cards with ease.",
  },
  {
    icon: Upload,
    title: "Bulk Data Upload",
    description:
      "Upload student rosters via CSV or add individuals one by one. Photos supported from files or live camera.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your institution's data is stored securely on the Internet Computer blockchain — no third-party access.",
  },
  {
    icon: Camera,
    title: "Live Photo Capture",
    description:
      "Capture photos directly from your device camera or upload from file — flexible for any workflow.",
  },
  {
    icon: CheckCircle,
    title: "Real-Time Order Tracking",
    description:
      "Follow your order from submission to delivery with live status updates at every step.",
  },
  {
    icon: Users,
    title: "Staff & Student Records",
    description:
      "Maintain separate records for teaching staff and students with roles and department classification.",
  },
];

const steps = [
  { num: "01", title: "Register", desc: "Create your institution account" },
  {
    num: "02",
    title: "Submit Order",
    desc: "Fill in card requirements and design preferences",
  },
  {
    num: "03",
    title: "Upload Data",
    desc: "Add student/staff records with photos",
  },
  {
    num: "04",
    title: "Track & Receive",
    desc: "Monitor progress and get cards delivered",
  },
];

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="portal-hero-gradient relative overflow-hidden">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.88 0.015 255 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.88 0.015 255 / 0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            {/* Logo mark */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
              <div className="h-7 w-7 rounded-lg bg-amber-400 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-amber-900" />
              </div>
              <span className="text-white/90 font-medium text-sm tracking-wide">
                ID Card Hub — Client Portal
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
              Professional ID Cards
              <br />
              <span className="text-amber-400">for Your Institution</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Submit your school's ID card orders, upload student and staff
              data, and track manufacturing progress — all from one secure
              portal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-8 h-12 text-base shadow-lg"
                onClick={() => login()}
                disabled={isLoggingIn}
              >
                <LogIn className="mr-2 h-5 w-5" />
                {isLoggingIn ? "Signing in…" : "Sign In / Register"}
              </Button>
              <p className="text-sm text-white/50">
                Secure login via Internet Identity
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Simple four-step process from order to delivery
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-lg mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">
              Everything You Need
            </h2>
            <p className="text-muted-foreground">
              Designed specifically for educational institutions
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-card rounded-xl border border-border/60 p-6 shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join schools and colleges already using ID Card Hub for their
            identity card needs.
          </p>
          <Button
            size="lg"
            className="px-10 h-12 text-base font-semibold"
            onClick={() => login()}
            disabled={isLoggingIn}
          >
            <LogIn className="mr-2 h-5 w-5" />
            {isLoggingIn ? "Signing in…" : "Create Your Account"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <p className="text-xs text-center text-muted-foreground/60">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground underline underline-offset-2 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

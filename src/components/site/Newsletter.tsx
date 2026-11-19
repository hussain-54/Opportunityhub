import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { assertFormCooldown, FORM_KEYS, isHoneypotFilled, markFormSubmitted } from "@/lib/form-guard";

interface Props {
  variant?: "card" | "banner";
  source?: string;
}

export function Newsletter({ variant = "banner", source = "site" }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (isHoneypotFilled(form.get("company"))) {
      toast.success("You're subscribed. Thanks for joining the briefing.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 255) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const cooldown = assertFormCooldown(FORM_KEYS.newsletter);
    if (cooldown) {
      toast.error(cooldown);
      return;
    }

    const trimmedName = name.trim().slice(0, 100) || null;
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: trimmedEmail, first_name: trimmedName, source });
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.success("You're already subscribed — thanks!");
        markFormSubmitted(FORM_KEYS.newsletter);
      } else {
        toast.error("Couldn't subscribe right now. Please try again.");
        return;
      }
    } else {
      markFormSubmitted(FORM_KEYS.newsletter);
      toast.success("You're subscribed. Thanks for joining the briefing.");
    }
    setEmail("");
    setName("");
  }

  if (variant === "card") {
    return (
      <div className="bg-navy text-white p-6">
        <h3 className="font-serif text-xl font-bold mb-2">The Briefing</h3>
        <p className="text-xs text-white/70 mb-4 leading-relaxed">
          Top opportunities in your inbox — curated weekly, no spam.
        </p>
        <form onSubmit={onSubmit} className="space-y-2">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full bg-white/10 border border-white/20 px-3 py-2 text-xs font-mono outline-none placeholder:text-white/40 focus:border-bridge"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bridge text-white py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-navy transition-colors disabled:opacity-60"
          >
            {loading ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        <p className="mt-3 text-[10px] text-white/40">
          <Link to="/unsubscribe" className="underline hover:text-white/70">
            Unsubscribe
          </Link>
        </p>
      </div>
    );
  }

  return (
    <section className="bg-navy text-white">
      <div className="container-prose py-16 md:py-24 text-center">
        <span className="eyebrow text-bridge">The Briefing</span>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl font-bold max-w-2xl mx-auto text-balance">
          Never miss a life-changing deadline.
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-white/70">
          Students, founders, and researchers get our curated briefing each week. No spam.{" "}
          <Link to="/unsubscribe" className="underline text-white/80 hover:text-white">
            Unsubscribe anytime
          </Link>
          .
        </p>
        <form onSubmit={onSubmit} className="mx-auto mt-10 flex max-w-xl flex-col sm:flex-row gap-3">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            className="sm:w-1/3 bg-white/10 border border-white/20 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-bridge"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-bridge"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-bridge px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-navy transition-colors disabled:opacity-60"
          >
            {loading ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
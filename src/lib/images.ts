import featuredScholarship from "@/assets/featured-scholarship.jpg";
import featuredAccelerator from "@/assets/featured-accelerator.jpg";
import featuredGrant from "@/assets/featured-grant.jpg";
import opInternship from "@/assets/op-internship.jpg";
import opConference from "@/assets/op-conference.jpg";
import opHackathon from "@/assets/op-hackathon.jpg";
import opFellowship from "@/assets/op-fellowship.jpg";

const seedMap: Record<string, string> = {
  "featured-scholarship.jpg": featuredScholarship,
  "featured-accelerator.jpg": featuredAccelerator,
  "featured-grant.jpg": featuredGrant,
  "op-internship.jpg": opInternship,
  "op-conference.jpg": opConference,
  "op-hackathon.jpg": opHackathon,
  "op-fellowship.jpg": opFellowship,
};

export function resolveImage(raw: string | null | undefined): string {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw;
  return seedMap[raw] ?? raw;
}

export const PLACEHOLDER_IMAGE = featuredScholarship;

// Type definitions for opportunities, categories, and blog posts.
// Data is fetched from Opportunity Hub database (see src/lib/content.ts).

export type CategorySlug = string;

export interface Category {
  slug: string;
  label: string;
  icon: string;
  blurb: string;
}

export interface Opportunity {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  country: string;
  deadline: string;
  funding: string;
  fundingAmount?: string;
  organizer: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  process: string[];
  overview: string[];
  officialUrl: string;
  featured?: boolean;
  trending?: boolean;
  publishedAt: string;
  readingMinutes: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  image: string;
  body: string[];
}

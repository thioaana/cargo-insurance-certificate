// app/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 text-center py-12">
        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Agro Proposal
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            A powerful Next.js application with Supabase integration
          </p>
          <Link href="/new-proposal">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
        </header>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
            <h3 className="text-xl font-semibold mb-2">Fast & Secure</h3>
            <p className="text-muted-foreground">
              Create and Update New Farmers Proposals
            </p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
            <h3 className="text-xl font-semibold mb-2">Authentication</h3>
            <p className="text-muted-foreground">
              Seamless user authentication with e-mail and password.
            </p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
            <h3 className="text-xl font-semibold mb-2">Database & Storage</h3>
            <p className="text-muted-foreground">
              Presents full table of Proposals in DB
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

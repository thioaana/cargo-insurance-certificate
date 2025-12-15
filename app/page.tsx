// app/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Download, Users, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cargo Insurance Certificate Management
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Streamline your cargo insurance workflow with professional certificate management.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </header>

        {/* Features Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Certificate Management</h3>
              </div>
              <p className="text-muted-foreground">
                Create and manage cargo insurance certificates with automatic
                numbering and validation.
              </p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Contract Integration</h3>
              </div>
              <p className="text-muted-foreground">
                Link certificates to contracts with built-in date and value
                limit validation.
              </p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Download className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">PDF Export</h3>
              </div>
              <p className="text-muted-foreground">
                Generate professional PDF certificates ready for clients and
                documentation.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">For Administrators</h3>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li>• Manage insurance contracts</li>
                <li>• View and manage all certificates</li>
                <li>• Assign contracts to brokers</li>
                <li>• Full system access and oversight</li>
              </ul>
            </div>
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">For Brokers</h3>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li>• Create certificates for assigned contracts</li>
                <li>• Automatic currency conversion</li>
                <li>• Download PDF certificates</li>
                <li>• Manage your certificate portfolio</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

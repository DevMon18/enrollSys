import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <main className="flex flex-col items-center gap-8 row-start-2 items-center sm:items-start text-center">
        <h1 className="text-4xl font-bold text-primary">Welcome to EnrollSys</h1>
        <p className="text-muted-foreground max-w-md">
          The centralized enrollment and management system.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">Go to Login</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

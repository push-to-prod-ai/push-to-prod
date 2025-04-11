import { Button } from "@/components/ui/button";
import { FC } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PromptTemplatesPreview } from "@/components/prompt-templates-preview";

export const HeroSection: FC = () => {
  return (
    <div className="bg-gradient-to-t from-zinc-50 to-white dark:from-zinc-900 dark:to-black relative">
      <div className="absolute bg-[url('/_convertfast/gradient-bg-0.svg')] bg-auto bg-no-repeat z-0 inset-0 top-0 bottom-0 left-0 right-0 grayscale dark:opacity-30 dark:invert-[0.25]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-6 drop-shadow-md">
            Accelerate your workflow with PushToProd.ai 
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8">
            A documentation engine and workflow accelerator built for developers
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="https://github.com/apps/pushtoprod-ai">
                Start now
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
              asChild
            >
              <Link 
                href="https://github.com/push-to-prod-ai/push-to-prod" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <code className="p-1 rounded">git clone git@github.com:push-to-prod-ai/push-to-prod.git</code>
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">Free and open-source. No credit card required.</p>
        </div>

        <div className="mt-8 sm:mt-12 relative">
          <Card className="shadow-2xl border">
            <CardContent>
              <PromptTemplatesPreview />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

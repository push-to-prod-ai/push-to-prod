// import { BGShapeCircle } from "@/components/bg-shape-circle";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import Image from "next/image";

export const HeroSection: FC = () => {
  return (
    <div className="bg-gradient-to-t from-zinc-50 to-white dark:from-zinc-950 to-black relative">
      <div className="absolute bg-[url('/_convertfast/gradient-bg-0.svg')] bg-auto bg-no-repeat z-0 inset-0 top-0 bottom-0 left-0 right-0 grayscale"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-6 drop-shadow-md">
            Accelerate your workflow with PushToProd.ai
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8">
            Build stunning landing pages with ease and convert your customers faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="#start">
                Start now
              </a>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <code className="p-1 rounded">npm install convertfast-ui</code>
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">Free and open-source. No credit card required.</p>
        </div>

        <div className="mt-8 sm:mt-12 relative block dark:hidden">
          <Image
            alt="app screenshot"
            src="https://ui.convertfa.st/images/graphic-walker-light-2.png"
            width={2432}
            height={1442}
            quality={90}
            priority
            className="rounded-md shadow-2xl border"
          />
        </div>
        <div className="mt-8 sm:mt-12 relative hidden dark:block">
          <Image
            alt="app screenshot"
            src="https://ui.convertfa.st/images/graphic-walker-dark-2.png"
            width={2432}
            height={1442}
            quality={90}
            priority
            className="rounded-md shadow-2xl border"
          />
        </div>
      </div>
    </div>
  );
};

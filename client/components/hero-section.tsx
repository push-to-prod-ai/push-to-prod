// import { BGShapeCircle } from "@/components/bg-shape-circle";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

export const HeroSection: FC = () => {
  return (
    <div className="bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-black relative to-white">
      <div className="absolute inset-0 top-0 bottom-0 left-0 right-0 z-0 bg-[url('/_convertfast/gradient-bg-0.svg')] bg-auto bg-no-repeat grayscale"></div>
      <div className="py-20 sm:py-24 lg:py-32 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary drop-shadow-md sm:text-5xl lg:text-6xl">
            Accelerate your workflow with PushToProd.ai
          </h1>
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            A documentation engine and workflow accelerator built for developers
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="https://github.com/apps/pushtoprod-ai">Start now</a>
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
                <code className="rounded p-1">
                  git clone git@github.com:push-to-prod-ai/push-to-prod.git
                </code>
              </Link>
            </Button>
          </div>
          <p className="text-gray-500 mt-4 text-sm">
            Free and open-source. No credit card required.
          </p>
        </div>

        <div className="relative mt-8 block dark:hidden sm:mt-12">
          <Image
            alt="app screenshot"
            src="/pushtoprod_main.png"
            width={2432}
            height={1442}
            quality={90}
            priority
            className="shadow-2xl rounded-md border"
          />
        </div>
        <div className="relative mt-8 hidden dark:block sm:mt-12">
          <Image
            alt="app screenshot"
            src="/pushtoprod_main.png"
            width={2432}
            height={1442}
            quality={90}
            priority
            className="shadow-2xl rounded-md border"
          />
        </div>
      </div>
    </div>
  );
};

import { FC } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { BGShapeCircle } from "@/components/bg-shape-circle";

interface CTAData {
  title?: string;
  description?: string;
}

export const CTA: FC<CTAData> = (props) => {
  const {
    title = "Ready to improve your documentation?",
    description = "PushToProd.ai automatically generates detailed PR descriptions by analyzing your code changes, saving time and improving code review quality. Get started in minutes with our GitHub App.",
  } = props;
  return (
    <section className="bg-gradient-to-t from-zinc-50 to-white dark:from-zinc-950 to-black relative">
      <div className="absolute bg-[url('/_convertfast/gradient-bg-0.svg')] bg-auto bg-no-repeat inset-0 top-0 bottom-0 left-0 right-0 grayscale bg-center"></div>
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="mt-6 text-xl leading-8 opacity-90 text-muted-foreground">{description}</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="https://github.com/apps/pushtoprodbot" target="_blank" rel="noopener noreferrer">
                Get started for free
              </Link>
            </Button>
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="https://github.com/push-to-prod-ai/push-to-prod" target="_blank" rel="noopener noreferrer">
                View documentation
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75 text-muted-foreground">
            No configuration required. Install and see results immediately.
          </p>
        </div>
      </div>
    </section>
  );
};

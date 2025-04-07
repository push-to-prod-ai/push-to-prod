import { Button } from "@/components/ui/button";
import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

interface FeatureItemProps {
  title: string;
  description: string;
  imageUrl: string;
  isImageLeft: boolean;
}

const FeatureItem: FC<FeatureItemProps> = ({
  title,
  description,
  imageUrl,
  isImageLeft,
}) => (
  <div className="md:gap-24 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
    {isImageLeft && (
      <div className="order-1 md:order-1">
        <Image
          src={imageUrl}
          alt={title}
          width={500}
          height={300}
          className="shadow-xl ring-gray-400/10 w-full max-w-2xl rounded-xl ring-1"
          quality={90}
        />
      </div>
    )}
    <div className={`order-2 ${isImageLeft ? "md:order-2" : "md:order-1"}`}>
      <h3 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {title}
      </h3>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        {description}
      </p>
      <div className="mt-4">
        <Button variant="secondary" asChild>
          <Link
            href="https://github.com/push-to-prod-ai/push-to-prod"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </Link>
        </Button>
      </div>
    </div>
    {!isImageLeft && (
      <div className="order-1 md:order-2">
        <Image
          src={imageUrl}
          alt={title}
          width={500}
          height={300}
          className="shadow-xl ring-gray-400/10 w-full max-w-2xl rounded-xl ring-1"
          quality={90}
        />
      </div>
    )}
  </div>
);

const DEFAULT_ITEMS: FeatureItemProps[] = [
  {
    title: "AI-Powered PR Descriptions",
    description:
      "Automatically generate detailed pull request descriptions when PRs are opened or reopened, saving developers time and improving code review quality.",
    imageUrl: "/prompts.png",
    isImageLeft: true,
  },
  {
    title: "Intelligent Code Analysis",
    description:
      "Our tool analyzes your code changes and provides context-aware summaries, helping reviewers quickly understand the purpose and impact of your changes.",
    imageUrl: "/pushtoprod_terminal.png",
    isImageLeft: false,
  },
  {
    title: "GitHub-Formatted Documentation",
    description:
      "Creates perfectly formatted markdown with proper code references and permalinks, making your PRs more readable and professional.",
    imageUrl: "/github.png",
    isImageLeft: true,
  },
];

interface FeatureSectionProps {
  items?: FeatureItemProps[];
  brand?: string;
  title?: string;
  description?: string;
}

export const FeatureSection: FC<FeatureSectionProps> = (props) => {
  const {
    items = DEFAULT_ITEMS,
    brand = "PushToProd.ai",
    title = "Streamline your documentation workflow",
    description = "PushToProd.ai is a powerful GitHub App that automatically generates intelligent PR descriptions by analyzing your code changes, improving team communication and speeding up code reviews.",
  } = props;

  return (
    <div id="features" className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <div className="text-base font-semibold leading-7 text-primary">
          {brand}
        </div>
        <h2 className="text-gray-900 mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-16">
        {items.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

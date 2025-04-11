import { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const DEFAULT_ITEMS: FAQItem[] = [
  {
    question: "What does PushToProd.ai do?",
    answer:
      "PushToProd.ai is a GitHub App that automatically generates detailed pull request descriptions by analyzing your code changes. It creates context-aware summaries with proper code references and permalinks, helping reviewers quickly understand the purpose and impact of your changes.",
  },
  {
    question: "How do I get started with PushToProd.ai?",
    answer:
      "Getting started is simple. Just install our GitHub App at github.com/apps/pushtoprodbot, open a pull request, and our bot will automatically analyze your changes and generate a description. No configuration required - you'll see results immediately.",
  },
  {
    question: "How does PushToProd.ai compare to manual PR descriptions?",
    answer:
      "Unlike manually writing PR descriptions, PushToProd.ai saves you valuable time by automatically analyzing code changes and generating comprehensive, well-formatted descriptions. It includes proper code references, creates GitHub-formatted markdown, and ensures consistency across your team's pull requests.",
  },
  {
    question: "Does PushToProd.ai respect existing PR templates?",
    answer:
      "Yes! PushToProd.ai respects and incorporates your repository's PR template (from .github/PULL_REQUEST_TEMPLATE.md) or falls back to a default template. It also preserves any existing content you've already added to your PR description.",
  },
  {
    question: "Can I self-host PushToProd.ai?",
    answer:
      "Absolutely. While we offer a hosted version, you can also self-host by forking our repository, setting up the required environment variables, deploying to your preferred cloud provider, and configuring your own GitHub App. Our documentation provides detailed instructions for this process.",
  },
];

export const FAQ: FC<{items?: FAQItem[]}> = (props) => {
  const { items = DEFAULT_ITEMS } = props;
  return (
    <section className="bg-gradient-to-t from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg shadow-sm border"
              >
                <AccordionTrigger className="px-4 py-4">
                  <span className="text-left font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
